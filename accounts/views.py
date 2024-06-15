from django.http import HttpResponse,JsonResponse
from django.template import loader,RequestContext
from .models import User,Session
from .forms import UserForm
from django.contrib.auth.hashers import make_password,check_password
import secrets
from datetime import datetime,timedelta
from django.db.models.functions import Now
app_name="accounts"



template=loader.get_template("base.html")

#---LOGIN

def LOGIN(request):# ERROR 401 unauthorized
	user=False
	session_key=request.COOKIES.get("session","")
	if(session_key):
		Session.objects.filter(date__lte=Now()).delete()
		session=Session.objects.filter(key=session_key).filter(client=request.META["HTTP_USER_AGENT"]).first()
		if(session):user=session.user
	return user

#---
def accounts(request):
	login=request.GET.get("login", False)
	if(not login):
		return HttpResponse(template.render({"content": "Missing argument"},request))
	user=User.objects.filter(login=login)
	if(not user):
		return HttpResponse(template.render({"content": "Bad login"},request),status=404)
	user=User.objects.get(login=login)
	return HttpResponse(template.render({"content": login},request))

def login(request):
	if(request.method=="POST"):
		session_key=request.COOKIES.get("session")
		if(str(request.POST["LOGIN"]) and (str(request.POST["PASSWORD"]))):
			try:user=User.objects.get(login=str(request.POST["LOGIN"]))
			except:
				try:user=User.objects.get(email=str(request.POST["LOGIN"]))
				except:user=False
			if(user and check_password(str(request.POST["PASSWORD"]),user.password)):
				session=Session.objects.filter(user=user).filter(client=request.META["HTTP_USER_AGENT"]).first()
				if(not session):
					session=Session()
					session.user=user
					session.date=(datetime.now()+timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
					session.client=request.META["HTTP_USER_AGENT"]
					session.key=secrets.token_urlsafe(2**10)
					session.save()
				session_key=session.key
				request.COOKIES["session"]=session_key
		user=LOGIN(request)
		if(user):return JsonResponse({"status":"1","login":user.login,"name":user.name,"lastname":user.lastname,"session":session_key},status=200)
		else:return JsonResponse({"status":"0"},status=200)
		return JsonResponse({"message": "Bad data"},status=200)
	return HttpResponse(template.render({"content":"Ошибка: страница не найдена"},request),status=404)

def register(request):
	if(request.method=="POST"):
		user=UserForm(request.POST)
		if(user.is_valid()):
			post=user.save(commit=False)
			post.password=make_password(post.password)
			post.save()
			return JsonResponse({"message":"На почтовый адрес направлено письмо для подтверждения регистрации."},status=200)
		return HttpResponse(template.render({"content": user},request))
	reg_template=loader.get_template("register.html")
	return HttpResponse(reg_template.render({},request))








