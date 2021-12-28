class CommonParams {

  static getSearchParamsFromObj(filters, accepted) {
    const _filters = {...filters};
    const searchParams = Object.keys(_filters).map(filterKey => {
      if (!_filters[filterKey])
        return '';
      if ((typeof accepted)!=='undefined') {
        if (!accepted.includes(filterKey))
          return '';
      }
      return `${filterKey}=${_filters[filterKey]}`;
    }).join('&');
    return searchParams;
  }
}

export default CommonParams;
