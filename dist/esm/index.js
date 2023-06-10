var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AbstractPagination {
}
export class PageNumberPagination {
    constructor(initPage = 1, limit = 10) {
        this.initPage = initPage;
        this.limit = limit;
        this.page = 1;
        this.page = initPage;
    }
    init() {
        this.page = this.initPage;
    }
    update(len) {
        if (len) {
            this.page += 1;
        }
    }
    params() {
        return { page: this.page, limit: this.limit };
    }
}
export class LimitOffsetPagination {
    constructor(initOffset = 0, limit = 10) {
        this.initOffset = initOffset;
        this.limit = limit;
        this.offset = 0;
        this.offset = initOffset;
    }
    init() {
        this.offset = this.initOffset;
    }
    update(len) {
        this.offset += len;
    }
    params() {
        return { offset: this.offset, limit: this.limit };
    }
}
export class ListMoreData {
    constructor(getData, options) {
        this.getData = getData;
        this.listData = [];
        this.pagination = new PageNumberPagination(1, 10);
        this.resultTransform = (result) => result;
        this.isLoading = false;
        this.isNotMore = false;
        this.isRefresh = false;
        if (options) {
            if (options.pagination !== undefined) {
                this.pagination = options.pagination;
            }
            if (options.resultTransform !== undefined) {
                this.resultTransform = options.resultTransform;
            }
        }
    }
    get status() {
        if (this.error)
            return "error";
        if (this.isDataEmpty)
            return "empty";
        if (this.isNotMore)
            return "noMore";
        if (this.isLoading)
            return "loading";
        return "more";
    }
    get isDataEmpty() {
        return !this.isLoading && this.listData.length === 0;
    }
    _getData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isLoading = true;
            this.isNotMore = false;
            const param = this.pagination.params();
            try {
                const data = yield this.getData(param).then(this.resultTransform);
                this.pagination.update(data ? data.length : 0);
                this.error = undefined;
                if (!data || data.length < param.limit) {
                    this.isNotMore = true;
                }
                return data || [];
            }
            catch (error) {
                this.error = error;
                return [];
            }
            finally {
                this.isLoading = false;
            }
        });
    }
    onInitData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.pagination.init();
            this.listData = [];
            this.listData = yield this._getData();
        });
    }
    onLoadMore() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._getData();
            if (data && data.length) {
                this.listData.push(...data);
            }
        });
    }
    onRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRefresh = true;
            yield this.onInitData();
            this.isRefresh = false;
        });
    }
}
