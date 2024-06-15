from django.urls import path
from . import views
app_name="music"
urlpatterns = [
	path("player", views.player, name="player"),
	path("upload", views.upload, name="upload"),
	path("musiclist", views.musiclist, name="musiclist"),
	path("addtomusiclist", views.addtomusiclist, name="addtomusiclist"),
	path("", views.music, name="music"),
]

