from django.urls import path
from api.views import health,groups,resources,quizzes,tutors,bookings
urlpatterns=[path("api/health/",health),path("api/groups/",groups),path("api/resources/",resources),path("api/quizzes/",quizzes),path("api/tutors/",tutors),path("api/bookings/",bookings)]