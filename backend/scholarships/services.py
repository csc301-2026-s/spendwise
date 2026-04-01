from __future__ import annotations

from decimal import Decimal

from django.conf import settings

from accounts.models import UserProfile
from scholarships.models import SavedScholarship, SavedScholarshipStatus


def deficit_from_profile(profile: UserProfile) -> Decimal:
    """
    Funding gap from profile fields.

    Note: This value is only "monthly" if the stored profile fields are monthly.
    effective_income = total_earnings + parental_support + scholarship_aid (if receiving aid).
    deficit = max(total_expenses - effective_income, 0).
    """
    def to_dec(v) -> Decimal:
        if v is None:
            return Decimal("0")
        return Decimal(str(v))

    expenses = to_dec(profile.total_expenses)
    revenue = to_dec(profile.total_earnings)
    parental = to_dec(profile.parental_support)
    aid = to_dec(profile.scholarship_aid_amount) if profile.receives_scholarships_or_aid else Decimal("0")
    effective = revenue + parental + aid
    gap = expenses - effective
    return gap if gap > 0 else Decimal("0")


def nominal_amount_for_scholarship(s) -> int:
    """Best-effort dollar amount for a scholarship row (max over min)."""
    if s.amount_max is not None:
        return int(s.amount_max)
    if s.amount_min is not None:
        return int(s.amount_min)
    return 0


def saved_scholarships_nominal_total(saved_rows) -> int:
    """Sum nominal amounts for iterable of SavedScholarship with .scholarship loaded."""
    return sum(nominal_amount_for_scholarship(row.scholarship) for row in saved_rows)


def compute_saved_scholarship_deficit_impact(user, probability_override: float | None = None) -> dict:
    """
    Dashboard-friendly estimate for the user's funding gap after potential scholarships.

    Returns a dict with:
      deficit, saved_count, total_nominal_amount,
      assumed_award_probability, potential_amount, remaining_deficit_after_potential,
      notes, disclaimer
    """
    profile, _ = UserProfile.objects.get_or_create(user=user)
    deficit = deficit_from_profile(profile)

    qs = (
        SavedScholarship.objects.filter(user=user)
        .exclude(status=SavedScholarshipStatus.NOT_AWARDED)
        .select_related("scholarship")
    )
    saved_count = qs.count()
    total_nominal_amount = saved_scholarships_nominal_total(qs)

    prob = (
        Decimal(str(probability_override))
        if probability_override is not None
        else Decimal(str(getattr(settings, "SCHOLARSHIP_ASSUMED_WIN_PROBABILITY", 0.8)))
    )
    prob = max(Decimal("0"), min(Decimal("1"), prob))

    # Scholarship amounts are nominal totals over time. We show the full nominal amount;
    # the probability is informational (and may be used client-side as a threshold/filter).
    potential_amount = Decimal(str(total_nominal_amount))
    remaining = deficit - potential_amount
    if remaining < 0:
        remaining = Decimal("0")

    def q(x: Decimal) -> str:
        return str(Decimal(x).quantize(Decimal("0.01")))

    return {
        "deficit": q(deficit),
        "saved_count": saved_count,
        "total_nominal_amount": total_nominal_amount,
        "assumed_award_probability": float(prob),
        "potential_amount": q(potential_amount),
        "remaining_deficit_after_potential": q(remaining),
        "notes": "Amounts reflect the nominal saved scholarship totals; probability is informational.",
        "disclaimer": "This is an estimate for planning only. Scholarships are not guaranteed and amounts/deadlines may change.",
    }
