from django.http import JsonResponse
def health(request): return JsonResponse({"service":"StudySync API","status":"ok"})
def groups(request): return JsonResponse({"items":[],"module":"groups"})
def quizzes(request): return JsonResponse({"items":[],"module":"quizzes"})
def tutors(request): return JsonResponse({"items":[],"module":"tutors"})
def bookings(request): return JsonResponse({"items":[],"module":"bookings"})
