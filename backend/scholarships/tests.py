from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase

from .ingest_utils import parse_grad_cells, parse_undergrad_cells
from .models import AwardType, SavedScholarship, Scholarship, StudentLevel

User = get_user_model()


class IngestParserTests(TestCase):
    def test_undergrad_requires_nine_cells(self):
        self.assertIsNone(parse_undergrad_cells([]))

    def test_grad_requires_eight_cells(self):
        self.assertIsNone(parse_grad_cells([]))


class ScholarshipsAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        Scholarship.objects.create(
            title="CS Scholarship",
            description="For Computer Science undergraduates. Domestic students.",
            offered_by="UofT",
            award_type=AwardType.IN_COURSE,
            student_level=StudentLevel.UNDERGRAD,
            is_active=True,
            open_to_domestic=True,
            open_to_international=False,
            nature_academic_merit=True,
            application_required=True,
            amount_min=1000,
            amount_max=2000,
            deadline=date(2026, 3, 1),
        )
        Scholarship.objects.create(
            title="International Bursary",
            description="For international students with financial need.",
            offered_by="UofT",
            award_type=AwardType.ADMISSIONS,
            student_level=StudentLevel.UNDERGRAD,
            is_active=True,
            open_to_domestic=False,
            open_to_international=True,
            nature_financial_need=True,
            application_required=False,
            amount_min=500,
            deadline=date(2026, 4, 1),
        )
        Scholarship.objects.create(
            title="Grad Research Award",
            description="For graduate students in engineering.",
            offered_by="UofT",
            student_level=StudentLevel.GRAD,
            is_active=True,
            open_to_domestic=True,
            open_to_international=True,
            nature_academic_merit=True,
            application_required=True,
            amount_min=5000,
            deadline=date(2026, 5, 1),
        )

    def test_list_returns_paginated(self):
        res = self.client.get("/api/scholarships/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("results", res.data)

    def test_search_q(self):
        res = self.client.get("/api/scholarships/?q=computer")
        self.assertEqual(res.status_code, 200)
        titles = [x["title"] for x in res.data["results"]]
        self.assertIn("CS Scholarship", titles)

    def test_filter_citizenship(self):
        res = self.client.get("/api/scholarships/?citizenship=Domestic")
        self.assertEqual(res.status_code, 200)
        titles = [x["title"] for x in res.data["results"]]
        self.assertIn("CS Scholarship", titles)

    def test_sort_amount_desc(self):
        res = self.client.get("/api/scholarships/?sort=-amount&student_level=undergrad")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["results"][0]["title"], "CS Scholarship")

    def test_meta(self):
        res = self.client.get("/api/scholarships/meta/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("award_type", res.data)
        self.assertIn("citizenship", res.data)
        self.assertIn("nature", res.data)

    def test_match(self):
        payload = {
            "faculty": "Computer Science",
            "major": "Computer Science",
            "year": 2,
            "degree_type": "Undergrad",
            "citizenship": "Domestic",
            "campus": "St.George",
        }
        res = self.client.post("/api/scholarships/match/", payload, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)
        self.assertIn("score", res.data[0])
        self.assertIn("reasons", res.data[0])
        self.assertIn("scholarship", res.data[0])
        self.assertIn("eligible", res.data[0])

    def test_match_filters_grad_when_postgrad(self):
        payload = {
            "degree_type": "Postgrad",
            "citizenship": "Domestic",
        }
        res = self.client.post("/api/scholarships/match/", payload, format="json")
        self.assertEqual(res.status_code, 200)
        titles = [x["scholarship"]["title"] for x in res.data]
        self.assertIn("Grad Research Award", titles)
        self.assertNotIn("CS Scholarship", titles)

    def test_saved_stats_requires_auth(self):
        res = self.client.get("/api/scholarships/saved/stats/")
        self.assertEqual(res.status_code, 401)

    def test_saved_stats(self):
        user = User.objects.create_user(username="t1@mail.utoronto.ca", email="t1@mail.utoronto.ca", password="x")
        self.client.force_authenticate(user=user)
        cs = Scholarship.objects.get(title="CS Scholarship")
        SavedScholarship.objects.create(user=user, scholarship=cs, status="awarded")
        res = self.client.get("/api/scholarships/saved/stats/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["awarded"], 1)
        self.assertEqual(res.data["not_awarded"], 0)
        self.assertEqual(res.data["acceptance_rate"], 1.0)
