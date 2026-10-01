import React, { useEffect, useState } from 'react'
import MasterLayout from '../../../MasterLayout'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import ReactDataTable from '../../../../shared/table/ReactDataTable';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap-v5';
import ActionButton from '../../../../shared/action-buttons/ActionButton';
import WhyChooseUsForm from './WhyChooseUsForm';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import { fetchFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const WhyChooseUs = ({ totalRecord, isLoading }) => {
  const dispatch = useDispatch();
  const whyChooseUsData = useSelector((state) => state.frontCMS);

  const [localItemsValue, setLocalItemsValue] = useState([]);
  const [showEdiModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState();

  useEffect(() => {
    dispatch(fetchFrontCMS(adminApiBaseURL.FRONT_CMS_WHY_CHOOSE_US, adminActionType.FETCH_WHY_CHOOSE_US));
  }, []);

  useEffect(() => {
    if (whyChooseUsData.length >= 0) {
      const mappedwhyChooseUsData = whyChooseUsData.map((data) => ({
        title: data?.attributes?.title,
        description: data?.attributes?.description,
        image: data?.attributes?.image,
        id: data?.id,
      }));
      setLocalItemsValue(mappedwhyChooseUsData);
    }
  }, [whyChooseUsData]);

  const onChange = (filter) => {

  };

  const goToEditWhyChooseUs = (data) => {
    setEditData(data);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  }

  const columns = [
    {
      name: getFormattedMessage("front-cms.table.column.title"),
      selector: (row) => row.title,
      className: "",
      sortField: "title",
      sortable: true,
    },
    {
      name: getFormattedMessage("front-cms.image.title"),
      sortable: false,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <Button type="button" className="btn-transparent me-2">
            <img src={row.image} height="50" width="50" alt="why choose us" className="image-circle" />
          </Button>
        </div>
      )
    },
    {
      name: getFormattedMessage("front-cms.description.title"),
      selector: (row) => {
        const content = row?.description
        const item = content?.replace(/<\/?.+?>/ig, '');
        return (
          <div className='ellipsis'>{item}</div>
        )
      },
      sortField: "description",
      sortable: true,
    },
    {
      name: getFormattedMessage("react-data-table.action.column.label"),
      right: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "120px",
      cell: (row) => (
        <ActionButton
          item={row}
          goToEditProduct={() => goToEditWhyChooseUs(row)}
          isEditMode={true}
          isDeleteIconShow={false}
          isDeleteMode={false}
        />
      ),
    },
  ];

  return (
    <MasterLayout>
      <TopProgressBar />
      <TabTitle title={placeholderText("front-cms.why.choose.us.title")} />

      <ReactDataTable
        columns={columns}
        items={localItemsValue}
        onChange={onChange}
        isLoading={isLoading}
        totalRows={totalRecord}
        pagination={false}
        isShowSearch
        subHeader={false}
      />

      {showEdiModal && (
        <WhyChooseUsForm show={showEdiModal} data={editData} handleClose={handleCloseModal} title={getFormattedMessage("front-cms.why.choose.us.title")} />
      )}

    </MasterLayout>
  )
}

const mapStateToProps = (state) => {
  const { totalRecord, isLoading } = state;
  return { totalRecord, isLoading };
};

export default connect(mapStateToProps)(WhyChooseUs);
