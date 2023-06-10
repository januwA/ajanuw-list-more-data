import {
  LimitOffsetPagination,
  ListMoreData,
  PageNumberPagination,
} from "../src/index";

describe("main", () => {
  it("test ListMoreData isDataEmpty", async () => {
    const lmd = new ListMoreData(
      async (p) => {
        expect(p.limit).toBe(10);
        expect(lmd.isLoading).toBe(true);
        return [];
      },
      {
        pagination: new PageNumberPagination(1, 10),
      }
    );

    expect(lmd.isLoading).toBe(false);
    await lmd.onInitData();
    expect(lmd.isLoading).toBe(false);

    expect(lmd.isDataEmpty).toBe(true);
    expect(lmd.isNotMore).toBe(true);
    expect(lmd.pagination.params()).toEqual({ limit: 10, page: 1 });
  });

  it("test ListMoreData error", async () => {
    const lmd = new ListMoreData(async (p) => {
      throw "error";
      return [];
    });

    expect(lmd.isLoading).toBe(false);
    await lmd.onInitData();
    expect(lmd.error).toBeTruthy();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.isDataEmpty).toBe(true);
    expect(lmd.isNotMore).toBe(false);
    expect(lmd.pagination.params()).toEqual({ limit: 10, page: 1 });
  });

  it("test ListMoreData onRefresh", async () => {
    const lmd = new ListMoreData(async (p) => {
      return [1];
    });
    await lmd.onInitData();
    expect(lmd.listData.length).toBe(1);

    expect(lmd.isLoading).toBe(false);
    expect(lmd.isRefresh).toBe(false);
    await lmd.onRefresh();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.isRefresh).toBe(false);
    expect(lmd.listData.length).toBe(1);
  });
});

describe("PageNumberPagination", () => {
  let data: number[] = [];
  const maxLen = 23;
  beforeAll(() => {
    for (let index = 0; index < maxLen; index++) {
      data.push(index);
    }
  });

  it("test ListMoreData", async () => {
    const lmd = new ListMoreData(
      async (p) => {
        return data.slice((p.page - 1) * p.limit, p.page * p.limit);
      },
      {
        pagination: new PageNumberPagination(1, 10),
      }
    );

    await lmd.onInitData();

    expect(lmd.isLoading).toBe(false);
    expect(lmd.isNotMore).toBe(false);
    expect(lmd.isDataEmpty).toBe(false);
    expect(lmd.error).toBeFalsy();
    expect(lmd.listData.length).toBe(10);

    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(20);
    expect(lmd.isNotMore).toBe(false);

    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(maxLen);
    expect(lmd.isNotMore).toBe(true);

    // 不会获取数据
    data.push(100);
    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(maxLen);
    expect(lmd.isNotMore).toBe(true);
  });
});

describe("LimitOffsetPagination", () => {
  let data: number[] = [];
  const maxLen = 23;
  beforeAll(() => {
    for (let index = 0; index < maxLen; index++) {
      data.push(index);
    }
  });

  it("test ListMoreData", async () => {
    const lmd = new ListMoreData(
      async (p) => {
        return data.slice(p.offset, p.offset + p.limit);
      },
      {
        pagination: new LimitOffsetPagination(0, 10),
      }
    );

    await lmd.onInitData();

    expect(lmd.isLoading).toBe(false);
    expect(lmd.isNotMore).toBe(false);
    expect(lmd.isDataEmpty).toBe(false);
    expect(lmd.error).toBeFalsy();
    expect(lmd.listData.length).toBe(10);

    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(20);
    expect(lmd.isNotMore).toBe(false);

    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(maxLen);
    expect(lmd.isNotMore).toBe(true);

    // 能获取到数据
    data.push(100);
    await lmd.onLoadMore();
    expect(lmd.isLoading).toBe(false);
    expect(lmd.listData.length).toBe(maxLen + 1);
    expect(lmd.isNotMore).toBe(true);
  });
});
