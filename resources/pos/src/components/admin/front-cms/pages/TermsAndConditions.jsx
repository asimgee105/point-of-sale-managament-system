import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import PagesSidebar from './PagesSidebar';
import MasterLayout from '../../../MasterLayout';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import { Button } from 'react-bootstrap-v5';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPages, updatePages } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const TermsAndConditions = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState("");
  const pagesData = useSelector(state => state.frontCMS.pages)

  useEffect(() => {
    if (!pagesData || Object.keys(pagesData).length === 0) {
      dispatch(fetchPages());
    }
  }, [dispatch, pagesData]);

  useEffect(() => {
    if (pagesData?.term_and_condition) {
      setData(pagesData?.term_and_condition);
    }
  }, [pagesData?.term_and_condition]);

  const onSubmit = () => {
    dispatch(updatePages({ term_and_condition: data }));
  };

  const onChangeInput = (event) => {
    const { value } = event.target;
    setData(value);
  };

  const disabled = pagesData?.term_and_condition === data

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("front-cms.terms-condition.title")} />
      <div className='card'>
        <div className='card-body payment_settings'>
          <div className="row">
            <div className="w-100 d-flex">
              <div>
                <PagesSidebar />
              </div>
              <div className="w-100 pages-quill">
                <ReactQuill
                  theme="snow"
                  value={data || ""}
                  onChange={(content) =>
                    onChangeInput({ target: { name: "term_and_condition", value: content } })
                  }
                />
                <Button variant="primary" disabled={disabled} className="mt-4" type='submit' onClick={onSubmit}>
                  {getFormattedMessage("globally.save-btn")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default TermsAndConditions;

