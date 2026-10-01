import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom"
import MasterLayout from '../MasterLayout';
import { fetchLanguages, toggleLanguageStatus, toggleLanguageDefault } from '../../store/action/languageAction';
import ReactDataTable from '../../shared/table/ReactDataTable';
import DeleteLanguage from './DeleteLanguage';
import EditLanguage from './EditLanguage';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage } from '../../shared/sharedMethod';
import ActionButton from '../../shared/action-buttons/ActionButton';
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import CreateLanguage from "./CreateLanguage";

const Languages = ( props ) => {
    const { fetchLanguages, languages, totalRecord, isLoading, toggleLanguageStatus, toggleLanguageDefault } = props;
    const [ deleteModel, setDeleteModel ] = useState( false );
    const [ isDelete, setIsDelete ] = useState( null );
    const [ editModel, setEditModel ] = useState( false );
    const [ language, setLanguage ] = useState();
    const [ localItemsValue, setLocalItemsValue ] = useState([]);

    const handleClose = ( item ) => {
        setEditModel( !editModel );
        setLanguage( item );
    };

    const onClickDeleteModel = ( isDelete = null ) => {
        setDeleteModel( !deleteModel );
        setIsDelete( isDelete );
    };

    const onChange = ( filter ) => {
        fetchLanguages( filter, false );
    };

    const handleStatusChange = async (id, status) => {
        if (!id) return;

        const result = await toggleLanguageStatus(id);

        if (result.success) {
            setLocalItemsValue((prevState) =>
                prevState.map((item) =>
                    item.id == id ? { ...item, status: !item.status } : item
                )
            );
        }
    };

    const handleDefaultChange = async (id, is_default) => {
        if (!id || is_default) return;

        const result = await toggleLanguageDefault(id);

        if (result.success) {
            setLocalItemsValue((prevState) =>
                prevState.map((item) =>
                    item.id == id ? { ...item, is_default: !item.is_default } : {...item, is_default: false}
                )
            );
        }
    };

    const itemsValue = languages.length >= 0 && languages.map( language => {
        return (
            {
                name: language.attributes?.name,
                iso_code: language.attributes?.iso_code,
                status: language.attributes?.status,
                id: language?.id,
                is_default: language.attributes?.is_default == 1 || language.attributes?.is_default == true ? true : false,
            }
        )
    } );

    const columns = [
        {
            name: getFormattedMessage( 'globally.input.name.label' ),
            selector: row => row.name,
        },
        {
            name: getFormattedMessage( 'react-data-table.iso-date.column.label' ),
            selector: row => row.iso_code,
        },
        {
            name: getFormattedMessage( "globally.detail.status" ),
            selector: row => row.status,
            sortable: false,
            cell: row => {
                return (
                    <div className="d-flex align-items-center">
                        <label className="form-check form-switch form-switch-sm">
                            <input
                                type="checkbox"
                                checked={row.status}
                                onChange={(e) =>
                                    handleStatusChange(row.id, e.target.checked)
                                }
                                className="me-3 form-check-input cursor-pointer"
                            />
                            <div className="control__indicator" />
                        </label>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage( "default.title" ),
            selector: row => row.is_default,
            sortable: false,
            cell: row => {
                return (
                    <div className="d-flex align-items-center">
                        <label className="form-check form-switch form-switch-sm">
                            <input
                                type="checkbox"
                                checked={row.is_default}
                                onChange={(e) =>
                                    handleDefaultChange(row.id, row.is_default)
                                }
                                className="me-3 form-check-input cursor-pointer"
                            />
                            <div className="control__indicator" />
                        </label>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage( "react-data-table.translation.column.label" ),
            cell: row => <Link to={`/app/admin/languages/${row.id}`} className={"text-decoration-none"}>{getFormattedMessage( 'edit-translation.title' )}</Link>
        },
        {
            name: getFormattedMessage( 'react-data-table.action.column.label' ),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: row => <ActionButton item={row} goToEditProduct={handleClose} isEditMode={true}
                onClickDeleteModel={onClickDeleteModel} />
        }
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={"Languages"} />
            <ReactDataTable columns={columns} items={itemsValue} onChange={onChange} isLoading={isLoading}
                AddButton={<CreateLanguage />} title={"Languages"}
                totalRows={totalRecord} />
            <EditLanguage handleClose={handleClose} show={editModel} language={language} />
            <DeleteLanguage onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                onDelete={isDelete} />
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { languages, totalRecord, isLoading, allConfigData } = state;
    return { languages, totalRecord, isLoading, allConfigData }
};

export default connect( mapStateToProps, { fetchLanguages, toggleLanguageStatus, toggleLanguageDefault } )( Languages );

