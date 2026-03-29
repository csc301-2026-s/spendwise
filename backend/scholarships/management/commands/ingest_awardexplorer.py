import re
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarships.ingest_utils import (
    deactivate_stale_scholarships,
    prune_overdue_saved_scholarships,
    resolve_deadline_for_ingest,
)
from scholarships.models import Scholarship, StudentLevel

MAX_PAGES = 250
POST_URL = "https://uoftscholarships.smartsimple.com/ex/ex_openreport.jsp"

LEVEL_CONFIG = {
    "undergrad": {
        "base_url": "https://awardexplorer.utoronto.ca/undergrad",
        "reportid": "46862",
        "reportname": "Award Explorer | Undergraduate | University of Toronto",
        "student_level": StudentLevel.UNDERGRAD,
    },
    "grad": {
        "base_url": "https://awardexplorer.utoronto.ca/grad",
        "reportid": "46864",
        "reportname": "Award Explorer | Graduate | University of Toronto",
        "student_level": StudentLevel.GRAD,
    },
}


def clean_text(text):
    if not text:
        return text
    return text.replace("\x00", "")


def parse_amount(amount_text):
    if not amount_text:
        return None, None
    numbers = [int(n.replace(",", "")) for n in re.findall(r"\d[\d,]*", amount_text)]
    if not numbers:
        return None, None
    if len(numbers) == 1:
        return numbers[0], numbers[0]
    return min(numbers), max(numbers)


def parse_row_cells(cells):
    """Parse table row into field dict; returns None if row too short."""
    if len(cells) < 9:
        return None

    title = clean_text(cells[0].text.strip())

    desc = cells[1].find(text=True, recursive=False)
    if desc:
        desc = clean_text(desc.strip())
    else:
        desc = clean_text(cells[1].text.strip())

    offered_by = clean_text(cells[2].text.strip()) or None
    award_type_raw = clean_text(cells[3].text.strip().lower())
    award_type_map = {
        "admission": "admissions",
        "in-course": "in_course",
        "graduating": "graduating",
    }
    award_type = award_type_map.get(award_type_raw, None)

    url_tag = cells[1].find("a")
    url = clean_text(url_tag["href"]) if url_tag else None

    app_cell = clean_text(cells[5].text.strip())
    app_tag = cells[5].find("a")
    application_required = "yes" in app_cell.lower()
    application_url = clean_text(app_tag["href"]) if app_tag else None

    citizenship_raw = clean_text(cells[4].text.strip().lower())
    open_to_domestic = "domestic" in citizenship_raw
    open_to_international = "international" in citizenship_raw

    nature_raw = clean_text(cells[6].text.strip().lower())
    nature_academic_merit = "academic merit" in nature_raw
    nature_athletic_performance = "athletic performance" in nature_raw
    nature_community = "community" in nature_raw
    nature_financial_need = "financial need" in nature_raw
    nature_leadership = "leadership" in nature_raw
    nature_indigenous = "indigenous" in nature_raw
    nature_black_students = "black students" in nature_raw
    nature_extracurriculars = (
        "extra curriculars" in nature_raw or "extracurriculars" in nature_raw
    )
    nature_other = "other" in nature_raw

    deadline_raw = clean_text(cells[7].text.strip())
    deadline_parsed = None
    if deadline_raw:
        try:
            deadline_parsed = datetime.strptime(
                deadline_raw, "%Y-%m-%d %H:%M"
            ).date()
        except ValueError:
            pass

    amount_text = clean_text(cells[8].text.strip()) or None
    amount_min, amount_max = parse_amount(amount_text)

    return {
        "title": title,
        "description": desc,
        "offered_by": offered_by,
        "award_type": award_type,
        "url": url,
        "application_required": application_required,
        "application_url": application_url,
        "open_to_domestic": open_to_domestic,
        "open_to_international": open_to_international,
        "nature_academic_merit": nature_academic_merit,
        "nature_athletic_performance": nature_athletic_performance,
        "nature_community": nature_community,
        "nature_financial_need": nature_financial_need,
        "nature_leadership": nature_leadership,
        "nature_indigenous": nature_indigenous,
        "nature_black_students": nature_black_students,
        "nature_extracurriculars": nature_extracurriculars,
        "nature_other": nature_other,
        "deadline_parsed": deadline_parsed,
        "amount_text": amount_text,
        "amount_min": amount_min,
        "amount_max": amount_max,
    }


class Command(BaseCommand):
    help = "Scrape scholarships from UofT Award Explorer (undergraduate or graduate catalog)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--level",
            choices=["undergrad", "grad"],
            default="undergrad",
            help="Which Award Explorer catalog to ingest (default: undergrad).",
        )
        parser.add_argument(
            "--no-cleanup",
            action="store_true",
            help="Skip deactivating stale rows and pruning overdue saved scholarships.",
        )
        parser.add_argument(
            "--prune-grace-days",
            type=int,
            default=21,
            help="Days after deadline before pruning saved/in_progress items (default: 21).",
        )

    def handle(self, *args, **options):
        level_key = options["level"]
        cfg = LEVEL_CONFIG[level_key]
        student_level = cfg["student_level"]
        no_cleanup = options["no_cleanup"]
        grace_days = options["prune_grace_days"]

        session = requests.Session()
        self.stdout.write(f"Fetching {cfg['base_url']}...")
        response = session.get(cfg["base_url"], timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        token_input = soup.find("input", {"name": "token"})
        if not token_input or not token_input.get("value"):
            self.stderr.write("Could not find token on Award Explorer page.")
            return
        token = token_input["value"]

        run_started_at = timezone.now()
        created_count = 0
        updated_count = 0
        page = 1
        seen_signatures = set()

        while page <= MAX_PAGES:
            self.stdout.write(f"Scraping page {page}...")

            data = {
                "ss_formtoken": "",
                "isframe": "1",
                "cf_4_c1753503": "",
                "cf_0_c1754210": "",
                "cf_1_c1753296": "%",
                "cf_2_c1744720": "",
                "cf_5_c1744705": "%",
                "cf_3_c1744765": "%",
                "reportid": cfg["reportid"],
                "reportname": cfg["reportname"],
                "chartid": "0",
                "export": "",
                "token": token,
                "key": "",
                "lang": "0",
                "width": "640",
                "height": "400",
                "curpagesize": "20",
                "page": str(page),
                "sorttype": "",
                "sortdirection": "asc",
            }

            result = session.post(POST_URL, data=data, timeout=30)
            result.raise_for_status()
            soup = BeautifulSoup(result.text, "html.parser")
            rows = soup.select("tbody#x-body tr")

            if not rows:
                break

            first_title = rows[0].find_all("td")[0].get_text(strip=True)
            last_title = rows[-1].find_all("td")[0].get_text(strip=True)
            sig = (first_title, last_title)
            if sig in seen_signatures:
                self.stdout.write("Reached repeated page content: stopping.")
                break
            seen_signatures.add(sig)

            for row in rows:
                cells = row.find_all("td")
                parsed = parse_row_cells(cells)
                if not parsed:
                    continue

                existing = Scholarship.objects.filter(
                    title=parsed["title"],
                    offered_by=parsed["offered_by"],
                    student_level=student_level,
                ).first()
                dl, est = resolve_deadline_for_ingest(
                    parsed["deadline_parsed"], existing
                )

                _, created = Scholarship.objects.update_or_create(
                    title=parsed["title"],
                    offered_by=parsed["offered_by"],
                    student_level=student_level,
                    defaults={
                        "source": "UOFT_AWARD_EXPLORER",
                        "description": parsed["description"],
                        "url": parsed["url"],
                        "award_type": parsed["award_type"],
                        "open_to_domestic": parsed["open_to_domestic"],
                        "open_to_international": parsed["open_to_international"],
                        "nature_academic_merit": parsed["nature_academic_merit"],
                        "nature_athletic_performance": parsed[
                            "nature_athletic_performance"
                        ],
                        "nature_community": parsed["nature_community"],
                        "nature_financial_need": parsed["nature_financial_need"],
                        "nature_leadership": parsed["nature_leadership"],
                        "nature_indigenous": parsed["nature_indigenous"],
                        "nature_black_students": parsed["nature_black_students"],
                        "nature_extracurriculars": parsed["nature_extracurriculars"],
                        "nature_other": parsed["nature_other"],
                        "application_required": parsed["application_required"],
                        "application_url": parsed["application_url"],
                        "amount_text": parsed["amount_text"],
                        "amount_min": parsed["amount_min"],
                        "amount_max": parsed["amount_max"],
                        "deadline": dl,
                        "deadline_is_estimated": est,
                        "last_seen_at": timezone.now(),
                        "is_active": True,
                    },
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

            page += 1

        if page > MAX_PAGES:
            self.stdout.write("Hit MAX_PAGES safety cap: stopped.")

        stale_count = 0
        pruned_count = 0
        if not no_cleanup:
            stale_count = deactivate_stale_scholarships(student_level, run_started_at)
            pruned_count = prune_overdue_saved_scholarships(grace_days=grace_days)
            self.stdout.write(
                f"Cleanup: deactivated {stale_count} stale rows for level={student_level}; "
                f"pruned {pruned_count} overdue saved scholarships (grace={grace_days}d)."
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done ({level_key}). Created: {created_count}, Updated: {updated_count}"
            )
        )
