from django.http import JsonResponse
def result(module): return JsonResponse({"service":"StudySync","module":module,"status":"ok","items":[]})
def health(request): return result("health")
def groups(request): return result("groups")
def resources(request): return result("resources")
def quizzes(request): return result("quizzes")
def tutors(request): return result("tutors")
def bookings(request): return result("bookings")
