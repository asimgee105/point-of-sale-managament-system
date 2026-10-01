import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import PagesSidebar from './PagesSidebar';
import MasterLayout from '../../../MasterLayout';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import { Button } from 'react-bootstrap-v5';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPages, updatePages } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const RefundPolicy = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState("");
  const pagesData = useSelector(state => state.frontCMS.pages)

  useEffect(() => {
    if (!pagesData || Object.keys(pagesData).length === 0) {
      dispatch(fetchPages());
    }
  }, [dispatch, pagesData]);

  useEffect(() => {
    if (pagesData?.refund_policy) {
      setData(pagesData?.refund_policy);
    }
  }, [pagesData?.refund_policy]);

  const onSubmit = () => {
    dispatch(updatePages({ refund_policy: data }));
  };

  const onChangeInput = (event) => {
    const { value } = event.target;
    setData(value);
  };

  const disabled = pagesData?.refund_policy === data

  return (
    <MasterLayout>
      <TabTitle title={placeholderText("front-cms.refund-policy.title")} />
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
                    onChangeInput({ target: { name: "refund_policy", value: content } })
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

export default RefundPolicy;

