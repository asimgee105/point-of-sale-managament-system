import { Button } from "react-bootstrap-v5";
import { Link } from "react-router-dom";

const TableButton = ({ buttonValue, to }) => {
    return (
        <div className="text-end order-2 mb-2">
            <Link to={to} className="text-decoration-none">
                <Button
                    type="button"
                    className="table-button"
                    variant="primary"
                >
                    <span className="text-white">{buttonValue}</span>
                </Button>
            </Link>
        </div>
    );
};

export default TableButton;
