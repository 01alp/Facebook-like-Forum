import { Pagination } from "react-bootstrap";

export default function GroupPagination({ total, current, onChangePage }) {
    let items = [];

    items.push(<Pagination.Prev key="prev" className="user-select-none" onClick={() => onChangePage(current - 1)} disabled={current === 1}>Previous</Pagination.Prev>);


    for (let page = 1; page <= total; page++) {
        items.push(<Pagination.Item key={page} data-page={page} active={current === page} onClick={() => onChangePage(page)}>
            {page}
        </Pagination.Item>);
    }


    items.push(<Pagination.Next key="next" className="user-select-none" onClick={() => onChangePage(current + 1)} disabled={current >= total}>Next</Pagination.Next>);

    return (
        <Pagination className="mb-auto">{items}</Pagination>
    );
}