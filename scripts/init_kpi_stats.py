from cassandra.cluster import Cluster

cluster = Cluster(['127.0.0.1'])
session = cluster.connect('ecommerce')

print("✅ Connected")


def compute_kpi(query, field, kpi_type):
    print(f"⏳ Computing {kpi_type}...")

    rows = session.execute(query)

    stats = {}

    for row in rows:
        key = getattr(row, field) or "Unknown"

        if key not in stats:
            stats[key] = 0

        stats[key] += 1

    print(f"✅ {len(stats)} keys found")

    # ⚠️ Clear old data
    for key in stats:
        session.execute(
            "DELETE FROM kpi_stats WHERE kpi_type = %s AND key = %s",
            (kpi_type, key)
        )

    # Insert new counts
    for key, count in stats.items():
        session.execute(
            "UPDATE kpi_stats SET value = value + %s WHERE kpi_type = %s AND key = %s",
            (count, kpi_type, key)
        )


# 🚀 Run KPIs
compute_kpi("SELECT country FROM customers", "country", "customers_by_country")
compute_kpi("SELECT industry FROM organizations", "industry", "orgs_by_industry")
compute_kpi("SELECT category FROM products", "category", "products_by_category")

print("🎉 All KPIs updated!")

cluster.shutdown()
