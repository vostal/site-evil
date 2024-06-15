from django.http import HttpResponse,JsonResponse
from django.template import loader
from .models import Track
from .forms import TrackForm
from django.contrib.auth.hashers import make_password,check_password
from datetime import datetime
from django.core.files.base import File
import base64
from accounts.views import LOGIN
from accounts.models import User
from django.shortcuts import redirect

template=loader.get_template("base.html")
player_template=loader.get_template("player.html")
upload_template=loader.get_template("upload_track.html")

def player(request):
	user=LOGIN(request)
	if(user):
		return HttpResponse(player_template.render({},request))
	else:return redirect("accounts:accounts_register")

def music(request):
	user=LOGIN(request)
	if(user):
		if(request.method=="POST"):
			ID=int(request.POST.get("ID", False))
			if(not ID):
				return JsonResponse({"content":"'ID' not found"},status=404)
			try:track=Track.objects.get(id=ID)
			except:track=False
			if(track):
				try:
					with open(track.file.path, "rb") as file:
						data = file.read()
					data = base64.b64encode(data).decode("ascii")
					return JsonResponse({"source": data}, status=200)
				except Exception as e:
					#track.delete()
					print("Exception when reading:", track.file, e)
			return JsonResponse({"content":"Music with id("+str(ID)+") not found"},status=404)
		return player(request)
	else:return redirect("accounts:accounts_register")

def upload(request):
	user=LOGIN(request)
	if(user):
		if(request.method=="POST"):
			track=TrackForm(request.POST, request.FILES)
			if(track.is_valid()):
				track=track.save(commit=False)
				track.user=user
				track.save()
				return JsonResponse({"message":"Track saved"},status=200)
			return JsonResponse({"message":"Error:"+track},status=200)
		#upload_template=loader.get_template("upload_track.html")#DEBUG
		return HttpResponse(upload_template.render())
	else:return redirect("accounts:accounts_register")

def musiclist(request):
	user=LOGIN(request)
	if(user):
		q=request.POST.get("q","")
		MYMUSIC=request.POST.get("mymusic",False)=="true"
		ALLMUSIC=not MYMUSIC
		tracks=[]
		output={}
		if(ALLMUSIC):
			if(q):
				for track in Track.objects.filter.contains(title__contains=q):
					tracks.append(track.id)
				for track in Track.objects.filter.contains(author__contains=q):
					tracks.append(track.id)
			else:
				for track in Track.objects.all():
					tracks.append(track.id)
		mymusiclist=user.GET_MUSICLIST()
		if(MYMUSIC):
			for track in mymusiclist:
				if(not track in tracks):tracks.append(track)
		ind=0
		for track in tracks:
			try:
				track=Track.objects.get(id=track)
				output[ind]={
					"name":track.title,
					"author":track.author,
					"image":"",
					"id":track.id,
					"time":"0:00",
					"inmymusic":("1" if (track.id in mymusiclist) else "0")
				}
			except:pass
			ind+=1
		return JsonResponse(output,status=200)
	else:return redirect("accounts:accounts_register")
def addtomusiclist(request):
	user=LOGIN(request)
	if(user):
		track_id=int(request.POST.get("track_id",0))
		flag_add=request.POST.get("flag_add",False)=="true"
		if(flag_add):flag=user.ADD_TO_MUSICLIST(track_id)
		else:flag=user.DEL_FROM_MUSICLIST(track_id)
		return JsonResponse({"success":"true" if flag else "false"},status=200)
	else:return redirect("accounts:accounts_register")

