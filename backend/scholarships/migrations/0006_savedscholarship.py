# Generated manually for SavedScholarship

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('scholarships', '0005_alter_scholarship_application_url_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedScholarship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('saved_at', models.DateTimeField(auto_now_add=True)),
                ('scholarship', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by_users', to='scholarships.scholarship')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_scholarships', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-saved_at'],
                'unique_together': {('user', 'scholarship')},
            },
        ),
    ]
