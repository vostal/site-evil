# Generated by Django 4.2.2 on 2023-07-30 22:45

import django.core.files.storage
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0003_rename_data_track_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='track',
            name='file',
            field=models.FileField(default=django.utils.timezone.now, storage=django.core.files.storage.FileSystemStorage(location='/media/music'), upload_to=''),
            preserve_default=False,
        ),
    ]