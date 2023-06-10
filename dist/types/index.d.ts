export declare abstract class AbstractPagination {
    abstract init(): void;
    abstract update(len: number): void;
    abstract params(): {
        [key: string]: number;
        limit: number;
    };
}
export declare class PageNumberPagination implements AbstractPagination {
    private readonly initPage;
    limit: number;
    page: number;
    constructor(initPage?: number, limit?: number);
    init(): void;
    update(len: number): void;
    params(): {
        page: number;
        limit: number;
    };
}
export declare class LimitOffsetPagination implements AbstractPagination {
    readonly initOffset: number;
    readonly limit: number;
    offset: number;
    constructor(initOffset?: number, limit?: number);
    init(): void;
    update(len: number): void;
    params(): {
        offset: number;
        limit: number;
    };
}
export declare class ListMoreData<T> {
    readonly getData: (...args: any[]) => Promise<T[]>;
    listData: T[];
    error?: any;
    pagination: AbstractPagination;
    resultTransform: (result: any) => T[];
    isLoading: boolean;
    isNotMore: boolean;
    isRefresh: boolean;
    constructor(getData: (...args: any[]) => Promise<T[]>, options?: {
        pagination?: AbstractPagination;
        resultTransform?: (result: any) => T[];
    });
    get status(): "error" | "empty" | "noMore" | "loading" | "more";
    get isDataEmpty(): boolean;
    private _getData;
    onInitData(): Promise<void>;
    onLoadMore(): Promise<void>;
    onRefresh(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map