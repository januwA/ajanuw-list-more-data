export abstract class AbstractPagination {
  abstract init(): void;
  abstract update(len: number): void;
  abstract params(): { [key: string]: number; limit: number };
}

export class PageNumberPagination implements AbstractPagination {
  page = 1;
  constructor(private readonly initPage = 1, public limit = 10) {
    this.page = initPage;
  }

  init() {
    this.page = this.initPage;
  }

  update(len: number) {
    if (len) {
      this.page += 1;
    }
  }

  params() {
    return { page: this.page, limit: this.limit };
  }
}

export class LimitOffsetPagination implements AbstractPagination {
  offset = 0;
  constructor(readonly initOffset = 0, readonly limit = 10) {
    this.offset = initOffset;
  }

  init() {
    this.offset = this.initOffset;
  }

  update(len: number) {
    this.offset += len;
  }

  params() {
    return { offset: this.offset, limit: this.limit };
  }
}

export class ListMoreData<T> {
  listData: T[] = [];
  error?: any;
  pagination: AbstractPagination = new PageNumberPagination(1, 10);
  resultTransform = (result: any): T[] => result;
  isLoading = false;
  isNotMore = false;
  isRefresh = false;

  constructor(
    public readonly getData: (...args: any[]) => Promise<T[]>,
    options?: {
      pagination?: AbstractPagination;
      resultTransform?: (result: any) => T[];
    }
  ) {
    if (options) {
      if (options.pagination !== undefined) {
        this.pagination = options.pagination;
      }

      if (options.resultTransform !== undefined) {
        this.resultTransform = options.resultTransform;
      }
    }
  }

  /**more/loading/noMore/empty/error */
  get status() {
    if (this.error) return "error";
    if (this.isDataEmpty) return "empty";
    if (this.isNotMore) return "noMore";
    if (this.isLoading) return "loading";
    return "more";
  }

  /**请求数据时，不确定数据是否为空 */
  get isDataEmpty() {
    return !this.isLoading && this.listData.length === 0;
  }

  private async _getData(): Promise<T[]> {
    this.isLoading = true;
    this.isNotMore = false;

    const param = this.pagination.params();

    try {
      const data = await this.getData(param).then(this.resultTransform);

      this.pagination.update(data ? data.length : 0);

      this.error = undefined;

      if (!data || data.length < param.limit) {
        this.isNotMore = true;
      }

      return data || [];
    } catch (error) {
      this.error = error;
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  async onInitData() {
    this.pagination.init();
    this.listData = [];
    this.listData = await this._getData();
  }

  /**
   * 上拉加载更多
   *
   * 如果卡了数据，只有刷新页面
   */
  async onLoadMore() {
    const data = await this._getData();
    if (data && data.length) {
      this.listData.push(...data);
    }
  }

  /**下拉刷新 */
  async onRefresh(): Promise<void> {
    this.isRefresh = true;
    await this.onInitData();
    this.isRefresh = false;
  }
}
