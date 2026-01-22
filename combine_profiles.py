
filenames = [f"batch_profiles_{i}_fixed.sql" for i in range(3, 10)]
with open("all_profiles_3_9.sql", "w", encoding="utf-8") as outfile:
    for fname in filenames:
        with open(fname, "r", encoding="utf-8") as infile:
            outfile.write(infile.read())
            outfile.write("\n")
