function SearchBar({ search, setSearch, onSearch, loading }) {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9">
          <form
            className="search-card shadow-lg rounded-pill overflow-hidden border border-1 d-flex align-items-center"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
            <input
              type="text"
              className="form-control border-0 px-4 py-3"
              placeholder="Search businesses, categories or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary px-4 fw-semibold" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
