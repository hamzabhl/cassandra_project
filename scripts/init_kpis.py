from cassandra.cluster import Cluster

cluster = Cluster(['127.0.0.1'])
session = cluster.connect('ecommerce')

print("✅ Connected to Cassandra")


def count_rows(table):
    print(f"⏳ Counting {table}...")
    rows = session.execute(f"SELECT * FROM {table}")

    count = 0
    for _ in rows:
        count += 1

    print(f"✅ {table}: {count}")
    return count


customers = count_rows("customers")
orgs = count_rows("organizations")
products = count_rows("products")

session.execute(
    "UPDATE kpis SET value = value + %s WHERE kpi_name = %s",
    (customers, "total_customers")
)

session.execute(
    "UPDATE kpis SET value = value + %s WHERE kpi_name = %s",
    (orgs, "total_organizations")
)

session.execute(
    "UPDATE kpis SET value = value + %s WHERE kpi_name = %s",
    (products, "total_products")
)

print("🎉 DONE")

cluster.shutdown()
