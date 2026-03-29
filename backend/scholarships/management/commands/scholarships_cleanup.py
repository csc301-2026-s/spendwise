from django.core.management.base import BaseCommand
<<<<<<< HEAD

from scholarships.ingest_utils import prune_overdue_saved_scholarships


class Command(BaseCommand):
    help = (
        "Prune overdue SavedScholarship rows (saved/in_progress only) after deadline + grace. "
        "Run weekly via cron, or rely on ingest_awardexplorer which runs this by default."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--prune-grace-days",
            type=int,
            default=21,
            help="Days after deadline before pruning (default: 21).",
        )

    def handle(self, *args, **options):
        n = prune_overdue_saved_scholarships(grace_days=options["prune_grace_days"])
        self.stdout.write(self.style.SUCCESS(f"Pruned {n} overdue saved scholarship link(s)."))
=======
from django.db.models import Count

from scholarships.models import Scholarship, StudentLevel


class Command(BaseCommand):
    help = "Report counts of scholarships by student level and active flag (diagnostic)."

    def handle(self, *args, **options):
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
>>>>>>> origin
