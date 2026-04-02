from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('historias', '0002_initial'),
        ('recursos', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='historia',
            name='id_portada',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='historias_portada',
                to='recursos.imagen',
            ),
        ),
    ]
