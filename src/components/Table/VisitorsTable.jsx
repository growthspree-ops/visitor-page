import React, { useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Table, Form, Button, InputGroup, Pagination, Row, Col } from "react-bootstrap";

export default function DataTableRB({ data, csvName, searchBarColumn, columnOrder }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState({ column: "", direction: "asc" });
  const gotoRef = useRef(null);

  // Derive columns from data keys (stable order)
  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const first = data[0];
    const columnKeys = Object.keys(first);
    if (columnOrder) {
      return columnOrder.filter((col) => columnKeys.includes(col)); // use the passed column order
    }
    return columnKeys; // fallback to default order
  }, [data, columnOrder]);

  // Ensure current page is in range when data, pageSize, or query changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, query, data]);

  const normalizedColumn = useMemo(() => (searchBarColumn || "").toLowerCase(), [searchBarColumn]);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = String(query).toLowerCase();

    // If the specified column exists, filter on that; else fallback to any column
    const hasColumn = columns.map((c) => c.toLowerCase()).includes(normalizedColumn);

    return data.filter((row) => {
      if (hasColumn) {
        const value = row[searchBarColumn];
        return value !== undefined && value !== null && String(value).toLowerCase().includes(q);
      }
      // Fallback: search across all columns
      return columns.some((col) => {
        const value = row[col];
        return value !== undefined && value !== null && String(value).toLowerCase().includes(q);
      });
    });
  }, [data, columns, query, normalizedColumn, searchBarColumn]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const startIdx = (clampedPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = filtered.slice(startIdx, endIdx);

  const handleDownloadCSV = () => {
    if (!columns.length) return;
    const csvRows = [];
    csvRows.push(columns.map(csvEscape).join(","));
    filtered.forEach((row) => {
      const line = columns.map((col) => csvEscape(row[col]));
      csvRows.push(line.join(","));
    });
    const csvBlob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ensureCsvExt(csvName || "data.csv");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleGotoKeyDown = (e) => {
    if (e.key === "Enter") {
      const val = Number(e.currentTarget.value);
      if (Number.isFinite(val)) {
        const next = Math.min(Math.max(1, Math.floor(val)), pageCount);
        setPage(next);
      }
    }
  };

  // Sorting functionality
  const handleSort = (column) => {
    const newDirection = sortOrder.direction === "asc" ? "desc" : "asc";
    setSortOrder({ column, direction: newDirection });
  };

  // Sort data based on the current sort order
  const sortedRows = useMemo(() => {
    if (!sortOrder.column) return pageRows;
    return [...pageRows].sort((a, b) => {
      const valueA = a[sortOrder.column];
      const valueB = b[sortOrder.column];
      if (valueA === valueB) return 0;

      if (sortOrder.direction === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }, [pageRows, sortOrder]);

  return (
    <div className="w-full">
      {/* Controls */}
      <Row className="g-2 align-items-end mb-1">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder={`Type to filter by ${searchBarColumn.replace('_', ' ')}`}
              aria-label="Search"
              aria-describedby="search-addon"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{background:"#fff"}}
              size="md"
            />
            {query && (
              <Button variant="outline-secondary" onClick={() => setQuery("")}>Clear</Button>
            )}
          </InputGroup>
        </Col>
        <Col md="auto" className="ms-auto d-flex gap-2">
          <div className="d-flex flex-column">
            <Form.Label className="mb-1">&nbsp;</Form.Label>
            <Button variant="primary" size="sm" onClick={handleDownloadCSV}>
              Download CSV
            </Button>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <div style={styles.tableWrapper} className="mb-2 table-responsive">
        <Table hover size="sm" className="mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={styles.stickyTh} title={col} onClick={() => handleSort(col)}>
                  <div className="text-truncate" style={{ maxWidth: 240 }}>
                    {col.replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                    {sortOrder.column === col && (
                      <span>{sortOrder.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">No data</td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col}>
                      <div className={`${col === "logo_url" || col === "company_name" ? "d-flex align-items-center" : "text-truncate"}`} style={{ maxWidth: 240 }} title={safeString(row[col])}>
                        {col === "company_name" && row["company_name"] ? (
                          <div className="d-flex align-items-center">
                            <img
                              src={row["logo_url"]}
                              alt="Logo"
                              style={{ width: 30, height: 30, borderRadius: "50%" }}
                            />
                            <span className="ms-2">{row["company_name"]}</span>
                          </div>
                        ) : col === "timestamp" ? (
                          new Date(row[col]).toLocaleString() // Convert timestamp to human-readable format
                        ) : (
                          String(row[col] ?? "")
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Footer with info + pagination */}
      <Row className="align-items-center">
        <Col className="text-muted small">
          {total > 0 ? (
            <>Showing <strong>{startIdx + 1}</strong>–<strong>{endIdx}</strong> of <strong>{total}</strong> entries</>
          ) : (
            <>Showing 0 entries</>
          )}
        </Col>
        <Col className="d-flex justify-content-end align-items-center gap-2">
          <Form.Group controlId="rowsPerPage" className="text-nowrap">
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Pagination className="mb-0">
            <Pagination.Prev disabled={clampedPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
            <Pagination.Item active>{clampedPage}</Pagination.Item>
            <Pagination.Next disabled={clampedPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} />
          </Pagination>
          <InputGroup style={{ maxWidth: 100 }}>
            <Form.Control
              ref={gotoRef}
              size="sm"
              type="number"
              min={1}
              max={pageCount}
              placeholder="Go to"
              onKeyDown={handleGotoKeyDown}
              style={{ margin: 0, height: "100%", padding: "8px 8px" }}
            />
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                const val = Number(gotoRef.current?.value);
                if (Number.isFinite(val)) {
                  const next = Math.min(Math.max(1, Math.floor(val)), pageCount);
                  setPage(next);
                }
              }}
              style={{ margin: 0 }}
            >
              Go
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </div>
  );
}

DataTableRB.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  csvName: PropTypes.string.isRequired,
  searchBarColumn: PropTypes.string.isRequired,
  columnOrder: PropTypes.arrayOf(PropTypes.string), // Added prop for column order
};

DataTableRB.defaultProps = {
  columnOrder: [], // Default to an empty array (no custom order)
};

// ===== Helpers =====
function csvEscape(value) {
  const s = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function ensureCsvExt(name) {
  return name.toLowerCase().endsWith(".csv") ? name : `${name}.csv`;
}

function safeString(v) {
  if (v === null || v === undefined) return "";
  try { return String(v); } catch { return ""; }
}

const styles = {
  tableWrapper: {
    maxHeight: 480,
    border: "1px solid var(--bs-border-color, #dee2e6)",
    overflow: "scroll",
  },
  stickyTh: {
    position: "sticky",
    top: 0,
    background: "var(--bs-body-bg, #fff)",
    zIndex: 2,
  },
};
