from django.urls import path
from .api import (
    ScholarshipsListAPI,
    ScholarshipDetailAPI,
    ScholarshipsMetaAPI,
    ScholarshipsMatchAPI,
    SavedScholarshipListAPI,
    SaveScholarshipAPI,
    UnsaveScholarshipAPI,
)

urlpatterns = [
    path("scholarships/", ScholarshipsListAPI.as_view(), name="scholarships-list"),
    path("scholarships/meta/", ScholarshipsMetaAPI.as_view(), name="scholarships-meta"),
    path("scholarships/match/", ScholarshipsMatchAPI.as_view(), name="scholarships-match"),
    path("scholarships/saved/", SavedScholarshipListAPI.as_view(), name="scholarships-saved"),
    path("scholarships/<uuid:pk>/", ScholarshipDetailAPI.as_view(), name="scholarships-detail"),
    path("scholarships/<uuid:pk>/save/", SaveScholarshipAPI.as_view(), name="scholarships-save"),
    path("scholarships/<uuid:pk>/unsave/", UnsaveScholarshipAPI.as_view(), name="scholarships-unsave"),
]
