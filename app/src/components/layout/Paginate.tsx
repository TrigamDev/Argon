import ReactPaginate from "react-paginate";

import "./Paginate.css";
import { isMobile } from "../../util/user";

export default function Paginate({ pages, onPageChange }: { pages: number, onPageChange: CallableFunction }) {
    const mobile = isMobile();
    return (
        <div className="page-foot">
            <ReactPaginate
                previousLabel={'<'}
                nextLabel={'>'}
                breakLabel={'...'}
                breakClassName={'break-me'}
                pageCount={pages}
                marginPagesDisplayed={mobile ? 0 : 1}
                pageRangeDisplayed={mobile ? 2 : 5}
                onPageChange={data => onPageChange(data.selected + 1)}
                containerClassName={'pagination'}
                activeClassName={'selected'}
            />
        </div>
    )
}