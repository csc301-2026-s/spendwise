from django.urls import path
from .views import RecommendedCodesAPI, SPCDealsAPI, TrendingCodesAPI

urlpatterns = [
    path("student-codes/spc/", SPCDealsAPI.as_view(), name="student-codes-spc"),
    path("student-codes/trending/", TrendingCodesAPI.as_view(), name="student-codes-trending"),
    path("student-codes/recommended/", RecommendedCodesAPI.as_view(), name="student-codes-recommended"),
]
