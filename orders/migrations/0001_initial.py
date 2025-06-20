# Generated by Django 4.2.7 on 2025-06-17 03:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customers', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_number', models.CharField(editable=False, max_length=50, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')], default='pending', max_length=20)),
                ('order_date', models.DateTimeField(auto_now_add=True)),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=10)),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('shipping_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total', models.DecimalField(decimal_places=2, max_digits=10)),
                ('shipping_address', models.TextField(blank=True, null=True)),
                ('billing_address', models.TextField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_orders', to=settings.AUTH_USER_MODEL)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='customers.customer')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_orders', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-order_date'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_name', models.CharField(max_length=200)),
                ('product_sku', models.CharField(blank=True, max_length=100, null=True)),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order')),
            ],
            options={
                'indexes': [models.Index(fields=['order'], name='orders_orde_order_i_5d347b_idx'), models.Index(fields=['product_sku'], name='orders_orde_product_ee2a89_idx')],
            },
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['order_number'], name='orders_orde_order_n_f3ada5_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['customer'], name='orders_orde_custome_59b6fb_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['status'], name='orders_orde_status_c6dd84_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['order_date'], name='orders_orde_order_d_d71205_idx'),
        ),
    ]
