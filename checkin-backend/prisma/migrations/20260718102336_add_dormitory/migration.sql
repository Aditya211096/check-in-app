-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isDormitory" BOOLEAN NOT NULL DEFAULT false,
    "totalBunkBeds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Room_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("id", "roomNumber", "roomType", "status", "tenantId") SELECT "id", "roomNumber", "roomType", "status", "tenantId" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_tenantId_roomNumber_key" ON "Room"("tenantId", "roomNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
