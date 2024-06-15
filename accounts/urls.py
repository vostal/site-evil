from django.urls import path
from . import views

urlpatterns = [
	path("", views.accounts, name="accounts"),
	path("login", views.login, name="accounts_login"),
	path("register", views.register, name="accounts_register"),
]



