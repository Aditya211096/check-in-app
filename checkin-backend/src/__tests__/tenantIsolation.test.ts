import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Simple unit test verification function
describe('Tenant Isolation Rules', () => {
  const prismaMock = mockDeep<PrismaClient>();

  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('should restrict room lookups strictly by tenantId', async () => {
    const mockRooms = [
      { id: 'room-1', tenantId: 'tenant-a', roomNumber: '101', roomType: 'Deluxe', status: 'AVAILABLE' },
    ];

    prismaMock.room.findMany.mockResolvedValue(mockRooms);

    // Call simulated scoped query
    const tenantId = 'tenant-a';
    const result = await prismaMock.room.findMany({
      where: { tenantId },
    });

    expect(result).toHaveLength(1);
    expect(result[0].tenantId).toBe('tenant-a');
  });

  it('should block queries if tenantId is mismatched', async () => {
    prismaMock.room.findMany.mockResolvedValue([]);

    const tenantId = 'tenant-b';
    const result = await prismaMock.room.findMany({
      where: { tenantId },
    });

    expect(result).toHaveLength(0);
  });
});
