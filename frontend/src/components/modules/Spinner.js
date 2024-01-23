import { Spinner } from "react-bootstrap";


export default function ModuleSpinner() {
    return (
        <Spinner animation="border" role="status">
            <span className="">Loading...</span>
        </Spinner>
    );
}