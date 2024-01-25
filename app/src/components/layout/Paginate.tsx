import ReactPaginate from "react-paginate";

import "./Paginate.css";

export default function Paginate({ pages, onPageChange }: { pages: number, onPageChange: CallableFunction }) {
    return (
        <div className="page-foot">
            <ReactPaginate
                previousLabel={'<'}
                nextLabel={'>'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pages}
                marginPagesDisplayed={1}
                pageRangeDisplayed={5}
                onPageChange={data => onPageChange(data.selected + 1)}
                containerClassName={'pagination'}
                activeClassName={'selected'}
            />
        </div>
    )
}