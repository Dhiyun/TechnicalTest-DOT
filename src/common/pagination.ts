export interface Halaman {
  page: number;
  limit: number;
}

export interface MetaHalaman extends Halaman {
  total: number;
  totalPages: number;
}

const LIMIT_BAWAAN = 10;
const LIMIT_MAKSIMAL = 100;

export function bacaHalaman(page?: string, limit?: string): Halaman {
  const nomor = Number.parseInt(page ?? '', 10);
  const jumlah = Number.parseInt(limit ?? '', 10);
  return {
    page: nomor > 0 ? nomor : 1,
    limit: jumlah > 0 ? Math.min(jumlah, LIMIT_MAKSIMAL) : LIMIT_BAWAAN,
  };
}

export function buatMeta(total: number, { page, limit }: Halaman): MetaHalaman {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function buatPagination(
  basePath: string,
  meta: MetaHalaman,
  search?: string,
) {
  const url = (page: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) {
      params.set('search', search);
    }
    return `${basePath}?${params.toString()}`;
  };
  const mulai = (meta.page - 1) * meta.limit;

  return {
    tampil: meta.totalPages > 1,
    mulai,
    info: meta.total
      ? `Menampilkan ${mulai + 1}–${Math.min(mulai + meta.limit, meta.total)} dari ${meta.total} data`
      : '',
    sebelumnya: meta.page > 1 ? url(meta.page - 1) : null,
    selanjutnya: meta.page < meta.totalPages ? url(meta.page + 1) : null,
    halaman: Array.from({ length: meta.totalPages }, (_, i) => ({
      number: i + 1,
      url: url(i + 1),
      aktif: i + 1 === meta.page,
    })),
  };
}
