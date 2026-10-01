import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";
import { editLanguageData, fetchLanguageData } from '../../store/action/languageAction';
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import { languageFileOptions } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";
import TabTitle from '../../shared/tab-title/TabTitle';

const EditLanguageData = ( props ) => {
    const { editLanguageData, language, fetchLanguageData } = props;
    const { id } = useParams();
    const navigate = useNavigate()
    const [ langJsonObj, setLangJsonObj ] = useState( {} )
    const [ langPhpObj, setLangPhpObj ] = useState( {} )
    const [ errorObj, setErrorObj ] = useState( {} )
    const [ successObj, setSuccessObj ] = useState( {} )
    const [ pdfObj, setPdfObj ] = useState( {} )
    const [ emailMessageObj, setEmailMessageObj ] = useState( {} )
    const [ frontWebMessageObj, setFrontWebMessageObj ] = useState( {} )
    const [ planMessageObj, setPlanMessageObj ] = useState( {} )
    const [ fileType, setFileType ] = useState( { type: 1 } )
    const [searchTerm, setSearchTerm] = useState(""); 

    useEffect( () => {
        fetchLanguageData( id )
    }, [] )

    let lang_json_array = language[ 0 ]?.lang_json_array
    let lang_php_array = language[ 0 ]?.lang_php_array;
    let errorArray = lang_php_array?.error
    let pdfArray = lang_php_array?.pdf
    let successArray = lang_php_array?.success
    let frontWebArray = lang_php_array?.front_web
    let emailMessageArray = lang_php_array?.email
    let planMessageArray = lang_php_array?.plan

    useEffect( () => {
        setLangJsonObj( lang_json_array )
        setLangPhpObj( lang_php_array )
        setErrorObj( errorArray )
        setSuccessObj( successArray )
        setPdfObj( pdfArray )
        setFrontWebMessageObj( frontWebArray )
        setEmailMessageObj( emailMessageArray )
        setPlanMessageObj( planMessageArray )
    }, [ lang_json_array, lang_php_array, errorArray, successArray, pdfArray, frontWebArray, emailMessageArray, planMessageArray ] )

    const languageFileTypeOption = languageFileOptions.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    const onFileTypeChange = ( obj ) => {
        setFileType( { type: obj.value } );
    };

    function str_replace ( string ) {
        return string.charAt( 0 ).toUpperCase() + string.slice( 1 ).replaceAll( '.', ' ' ).replaceAll( '-', ' ' ).replaceAll( '_', ' ' );
    }

    const onChangeInput = ( e ) => {
        e.preventDefault();
        const { name, value } = e.target;
        if ( fileType.type === 2 ) {
            setLangPhpObj( inputs => ( { ...inputs, [ name ]: value } ) )
        } else if ( fileType.type === 3 ) {
            setErrorObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                error: { ...language.error, [ name ]: value }
            } ) )
        } else if ( fileType.type === 4 ) {
            setSuccessObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                success: { ...language.success, [ name ]: value }
            } ) )
        } else if ( fileType.type === 5 ) {
            setPdfObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                pdf: { ...language.pdf, [ name ]: value }
            } ) )
        } else if ( fileType.type === 6 ) {
            setPlanMessageObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                plan: { ...language.plan, [ name ]: value }
            } ) )
        } else if ( fileType.type === 7 ) {
            setEmailMessageObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                email: { ...language.email, [ name ]: value }
            } ) )
        } else if ( fileType.type === 8 ) {
            setFrontWebMessageObj( inputs => ( { ...inputs, [ name ]: value } ) )
            setLangPhpObj( language => ( {
                ...language,
                front_web: { ...language.front_web, [ name ]: value }
            } ) )
        } else {
            setLangJsonObj((inputs) => ({ ...inputs, [name]: value }));
        }
    };

    // 🔍 Enhanced search logic: ignores underscores, dots, and case
    const filterKeys = (obj) => {
        if (!obj) return {};
        if (!searchTerm) return obj;

        const normalize = (text) =>
            text
                ?.toString()
                .toLowerCase()
                .replaceAll(/[_\.\-]+/g, " ") // replace _, ., - with spaces
                .replace(/\s+/g, " ") // collapse multiple spaces
                .trim();

        const normalizedSearch = normalize(searchTerm);

        return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => {
                const normKey = normalize(key);
                const normValue = normalize(value || "");
                return (
                    normKey.includes(normalizedSearch) ||
                    normValue.includes(normalizedSearch)
                );
            })
        );
    };

    const FetchLung = () => {
        const steps = [];
        let activeObj;

        switch (fileType.type) {
            case 1: activeObj = langJsonObj; break;
            case 2: activeObj = langPhpObj; break;
            case 3: activeObj = errorObj; break;
            case 4: activeObj = successObj; break;
            case 5: activeObj = pdfObj; break;
            case 6: activeObj = planMessageObj; break;
            case 7: activeObj = emailMessageObj; break;
            case 8: activeObj = frontWebMessageObj; break;
            default: activeObj = langJsonObj;
        }

        const filteredObj = filterKeys(activeObj); // 🔍 filter before rendering

        if(filteredObj && Object.keys(filteredObj).length == 0){
            return <div className='fs-5 px-3 py-6 custom-text-center'>{getFormattedMessage('sale.product.table.no-data.label')}</div>
        }
        for (const key in filteredObj) {
            if ((fileType.type === 2 || fileType.type === 1) && (key === 'pdf' || key === 'success' || key === 'error' || key === 'plan' || key === 'email' || key === 'front_web')) continue;

            steps.push(
                <div className={"col-md-4 mt-2"} key={key}>
                    <label className='form-label'>{str_replace(key)}:</label>
                    <input
                        type='text'
                        name={[key]}
                        value={filteredObj[key]}
                        placeholder={"Enter " + str_replace(key)}
                        className='form-control'
                        autoComplete='off'
                        onChange={(e) => onChangeInput(e)}
                    />
                </div>
            );
        }

        return steps;
    };


    const prepareFormData = ( prepareData, jsonArray ) => {
        const formValue = {
            lang_php_array: prepareData,
            lang_json_array: jsonArray,
            iso_code: language[ 0 ]?.iso_code
        }
        return formValue
    };

    const onSubmit = ( event ) => {
        event.preventDefault();
        editLanguageData( id, prepareFormData( langPhpObj, langJsonObj ) );
        navigate( "/app/admin/languages" );
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText('translation.manager.title')}/>
            <HeaderTitle title={getFormattedMessage( 'translation.manager.title' )} to='/app/admin/languages' />
            <div className={"card"}>
                <div className={"card-body"}>
                    <div className={"row mb-3"}>
                        <div className={"col-md-4"}>
                            <ReactSelect isRequired
                                data={languageFileTypeOption}
                                onChange={onFileTypeChange}
                                defaultValue={languageFileTypeOption[ 0 ]}
                            />
                        </div>
                        {/* 🔍 Search input */}
                        <div className="col-md-4">
                            <input
                                type="search"
                                className="form-control"
                                placeholder={placeholderText("dataTable.searchBar.placeholder.label")+ "..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={"form-group col-sm-3 mb-7 d-flex justify-content-end offset-3 ms-auto"}>
                            <button onClick={( event ) => onSubmit( event )} className={"btn btn-primary"}>Save</button>
                        </div>
                    </div>
                    <div className='row'>
                        {FetchLung()}
                    </div>
                </div>
            </div>
        </MasterLayout>
    )
};

const mapStateToProps = ( state ) => {
    const { language } = state;
    return { language }
};


export default connect( mapStateToProps, { editLanguageData, fetchLanguageData } )( EditLanguageData );
