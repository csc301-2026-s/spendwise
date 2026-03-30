from datetime import date
from django.core.management.base import BaseCommand
from django.db.models import Count
from scholarships.models import Scholarship, StudentLevel


def current_academic_year_start() -> date:
    """Returns Sept 1 of the current academic year (e.g. Sept 1 2025 for 2025-2026)."""
    today = date.today()
    year = today.year if today.month >= 9 else today.year - 1
    return date(year, 9, 1)


class Command(BaseCommand):
    help = "Report counts of scholarships by student level. Use --prune-stale to delete expired ones."

    def add_arguments(self, parser):
        parser.add_argument(
            "--prune-stale",
            action="store_true",
            help="Delete scholarships with deadlines before the current academic year start.",
        )

    def handle(self, *args, **options):
        if options["prune_stale"]:
            cutoff = current_academic_year_start()
            stale = Scholarship.objects.filter(
                deadline__isnull=False,
                deadline__lt=cutoff,
            )
            count = stale.count()
            stale.delete()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Pruned {count} stale scholarships (deadline before {cutoff})."
                )
            )

        self.stdout.write("Scholarship catalog snapshot")
        for sl in StudentLevel:
            n = Scholarship.objects.filter(student_level=sl.value).count()
            active = Scholarship.objects.filter(student_level=sl.value, is_active=True).count()
            self.stdout.write(f"  {sl.label}: total={n}, active={active}, inactive={n - active}")

        by_level = (
            Scholarship.objects.values("student_level", "is_active")
            .annotate(c=Count("id"))
            .order_by("student_level", "is_active")
        )
        self.stdout.write("Breakdown:")
        for row in by_level:
            self.stdout.write(
                f"  level={row['student_level']} active={row['is_active']} count={row['c']}"
            )
