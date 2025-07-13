"use server";

import { resetAndCreateCollections } from "@/lib/mongodb";

export async function migrate_db_action() {
    await resetAndCreateCollections();
}