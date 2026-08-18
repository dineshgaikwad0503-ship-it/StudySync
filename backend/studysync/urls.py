from django.urls import path
from api.views import health,groups,quizzes,tutors,bookings
urlpatterns=[
 path("api/health/",health),path("api/groups/",groups),
 path("api/quizzes/",quizzes),path("api/tutors/",tutors),path("api/bookings/",bookings)
]