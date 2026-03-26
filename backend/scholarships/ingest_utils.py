"""
Helpers for Award Explorer ingestion: default deadlines and catalog/saved cleanup.

Default deadline rule: next April 30 on or after the reference date; if that April 30
is strictly before the reference date, use April 30 of the following year.
(U of T–aligned end-of-academic-year proxy when the source omits a date.)
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import TYPE_CHECKING

from django.db import transaction
from django.utils import timezone

from .models import SavedScholarship, SavedScholarshipStatus, Scholarship, StudentLevel

if TYPE_CHECKING:
    pass


def default_school_year_end_deadline(reference: date) -> date:
    """Next April 30 that is still relevant for applications after `reference`."""
    y = reference.year
    this_year = date(y, 4, 30)
    if reference <= this_year:
        return this_year
    return date(y + 1, 4, 30)


def resolve_deadline_for_ingest(
    parsed_deadline: date | None,
    existing: Scholarship | None,
) -> tuple[date, bool]:
    """
    Returns (deadline, deadline_is_estimated).
    Preserves a previously reported deadline when the scrape has no date.
    """
    if parsed_deadline is not None:
        return parsed_deadline, False
    if existing and existing.deadline and not existing.deadline_is_estimated:
        return existing.deadline, False
    ref = timezone.now().date()
    return default_school_year_end_deadline(ref), True


@transaction.atomic
def deactivate_stale_scholarships(student_level: str, run_started_at) -> int:
    """Mark scholarships of this level not seen since run_started_at as inactive."""
    qs = Scholarship.objects.filter(
        student_level=student_level,
        last_seen_at__lt=run_started_at,
    )
    return qs.update(is_active=False)


@transaction.atomic
def prune_overdue_saved_scholarships(grace_days: int = 21) -> int:
    """
    Remove saved rows that are past deadline + grace for early pipeline statuses only.
    Submitted items are kept so users can still track outcomes.
    """
    today = timezone.now().date()
    cutoff = today - timedelta(days=grace_days)
    qs = SavedScholarship.objects.filter(
        status__in=[
            SavedScholarshipStatus.SAVED,
            SavedScholarshipStatus.IN_PROGRESS,
        ],
        scholarship__deadline__isnull=False,
        scholarship__deadline__lt=cutoff,
    )
    n = qs.count()
    qs.delete()
    return n
