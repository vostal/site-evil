from django.forms import ModelForm
from django import forms
from .models import Track

class TrackForm(ModelForm):
	class Meta:
		model=Track
		fields=["title","author","file"]


