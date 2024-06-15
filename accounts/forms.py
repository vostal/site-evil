from django.forms import ModelForm
from django import forms
from .models import User

class UserForm(ModelForm):
	class Meta:
		model=User
		fields=["login","email","name","lastname","password","gender","birth_date"]
	'''login=forms.CharField(max_length=64)
	email=forms.EmailField(max_length=256)

	name=forms.CharField(max_length=64)
	lastname=forms.CharField(max_length=64)

	password=forms.CharField(max_length=256)

	gender=forms.BooleanField()
	reg_date=forms.DateTimeField()
	birth_date=forms.DateField()'''


