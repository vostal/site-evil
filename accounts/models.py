from django.db import models
from django.core.files.storage import FileSystemStorage
from django.core.validators import int_list_validator

avatar_storage=FileSystemStorage(location="/media/avatar")

class User(models.Model):
	login=models.CharField(max_length=64,primary_key=True,null=False,name="login")
	email=models.EmailField(max_length=256,null=False,name="email")

	name=models.CharField(max_length=64,null=False,name="name")
	lastname=models.CharField(max_length=64,null=False,name="lastname")

	password=models.CharField(max_length=256,null=False,name="password")

	gender=models.BooleanField(default=True,null=False,name="gender")#True=Male
	reg_date=models.DateTimeField(auto_now_add=True,null=False,name="reg_date")
	birth_date=models.DateField(null=False,name="birth_date")
	photo=models.ImageField(storage=avatar_storage,null=True,max_length=100)
	
	confirmed=models.BooleanField(default=False,null=False,name="confirmed")

	musiclist=models.CharField(validators=[int_list_validator],null=False,default="",max_length=1024,name="musiclist") 

	def __str__(self):
		return self.login
	def GET_MUSICLIST(self):
		if(self.musiclist):
			return list(map(int,self.musiclist.split(",")))
		else:
			return []
	def SET_MUSICLIST(self,musiclist):
		self.musiclist=",".join(list(map(str,musiclist)))
		self.save()
	def ADD_TO_MUSICLIST(self,track):
		tracks=self.GET_MUSICLIST()
		if(not track in tracks):
			tracks.append(track)
			self.SET_MUSICLIST(tracks)
			return True
		return False
	def DEL_FROM_MUSICLIST(self,track):
		tracks=self.GET_MUSICLIST()
		if(track in tracks):
			tracks.remove(track)
			self.SET_MUSICLIST(tracks)
			return True
		return False


class Session(models.Model):
	user=models.ForeignKey(User,on_delete=models.CASCADE,null=False,name="user")
	client=models.CharField(max_length=64,null=False,name="client")
	date=models.DateTimeField(auto_now_add=True,null=False,name="date")
	key=models.CharField(max_length=2**10,null=False,name="key")
	def __str__(self):
		return self.user.login


