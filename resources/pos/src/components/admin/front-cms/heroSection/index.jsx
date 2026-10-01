import { faFacebook, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import TopProgressBar from '../../../../shared/components/loaders/TopProgressBar';
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { getFormattedMessage, phoneValidate, placeholderText } from '../../../../shared/sharedMethod';
import TabTitle from '../../../../shared/tab-title/TabTitle';
import { fetchFrontCMS, updateFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import MasterLayout from '../../../MasterLayout';
import * as EmailValidator from "email-validator";

const HeroSection = () => {
  const dispatch = useDispatch();
  const heroSection = useSelector((state) => state.frontCMS);
  const [logoFile, setLogoFile] = useState(null);
  const [heroSectionValue, setHeroSectionValue] = useState({
    hero_image: null,
    hero_title: "",
    hero_description: "",
    testimonial_main_title: "",
    hero_button_title: "",
    contact_us_main_title: "",
    contact_us_description: "",
    partner_main_title: "",
    partner_description: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    address: "",
    email: "",
    phone: ""
  });

  const [errors, setErrors] = useState({
    hero_image: "",
    hero_title: "",
    hero_description: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchFrontCMS(adminApiBaseURL.FRONT_CMS_HERO_SECTION, adminActionType.FETCH_HERO_SECTION));
  }, []);

  useEffect(() => {
    setHeroSectionValue({
      hero_image: heroSection.hero_image ? heroSection?.hero_image : null,
      hero_title: heroSection.hero_title ? heroSection.hero_title : "",
      hero_description: heroSection.hero_description ? heroSection.hero_description : "",
      testimonial_main_title: heroSection.testimonial_main_title ? heroSection.testimonial_main_title : "",
      hero_button_title: heroSection.hero_button_title ? heroSection.hero_button_title : "",
      partner_main_title: heroSection.partner_main_title ? heroSection.partner_main_title : "",
      partner_description: heroSection.partner_description ? heroSection.partner_description : "",
      contact_us_main_title: heroSection.contact_us_main_title ? heroSection.contact_us_main_title : "",
      contact_us_description: heroSection.contact_us_description ? heroSection.contact_us_description : "",
      facebook: heroSection.facebook ? heroSection.facebook : "",
      twitter: heroSection.twitter ? heroSection.twitter : "",
      linkedin: heroSection.linkedin ? heroSection.linkedin : "",
      address: heroSection.address ? heroSection.address : "",
      email: heroSection.email ? heroSection.email : "",
      phone: heroSection.phone ? heroSection.phone : ""
    })
    setLogoPreview(heroSection.hero_image);
  }, [heroSection]);

  const handleValidation = () => {
    let errorss = {};
    let isValid = false;
    if (!heroSectionValue["hero_image"]) {
      errorss["hero_image"] = getFormattedMessage(
        "image.select.validate.title"
      );
    } else if (!heroSectionValue["hero_title"]) {
      errorss["hero_title"] = getFormattedMessage(
        "front-cms.hero.title.validate.label"
      );
    } else if (!heroSectionValue["hero_description"]) {
      errorss["hero_description"] = getFormattedMessage(
        "front-cms.description.validate.label"
      );
    } else if (!heroSectionValue["hero_button_title"]) {
      errorss["hero_button_title"] = getFormattedMessage(
        "front-cms.button.validate.label"
      );
    } else if (!heroSectionValue["testimonial_main_title"]) {
      errorss["testimonial_main_title"] = getFormattedMessage(
        "testimonial.title.validate.label"
      );
    }  else if (!heroSectionValue["partner_main_title"]) {
      errorss["partner_main_title"] = getFormattedMessage(
        "front-cms.title.validate.label"
      );
    } else if (!heroSectionValue["partner_description"]) {
      errorss["partner_description"] = getFormattedMessage(
        "front-cms.description.validate.label"
      );
    } else if (!heroSectionValue["contact_us_main_title"]) {
      errorss["contact_us_main_title"] = getFormattedMessage(
        "front-cms.title.validate.label"
      );
    } else if (!heroSectionValue["contact_us_description"]) {
      errorss["contact_us_description"] = getFormattedMessage(
        "front-cms.description.validate.label"
      );
    } else if (!EmailValidator.validate(heroSectionValue["email"])) {
      if (!heroSectionValue["email"]) {
        errorss["email"] = getFormattedMessage(
          "globally.input.email.validate.label"
        );
      } else {
        errorss["email"] = getFormattedMessage(
          "globally.input.email.valid.validate.label"
        );
      }
    } else if (!heroSectionValue["address"]) {
      errorss["address"] = getFormattedMessage(
        "globally.input.address.validate.label"
      );
    } else if (!heroSectionValue["phone"].trim()) {
      errorss["phone"] = getFormattedMessage(
        "globally.input.phone-number.validate.label"
      );
    }
    else {
      isValid = true;
    }
    setErrors(errorss);
    return isValid;
  };

  const handleImageChange = (e, type) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          if (type === "hero_image") {
            setLogoPreview(fileReader.result);
            setLogoFile(file);
            setHeroSectionValue(prevState => ({
              ...prevState,
              hero_image: fileReader.result,
            }));
          }
        };
        fileReader.readAsDataURL(file);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHeroSectionValue(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const prepareFormData = (data) => {
    const formData = new FormData();
    if (logoFile) {
      formData.append("hero_image", logoFile);
    }
    formData.append("hero_title", data.hero_title);
    formData.append("hero_description", data.hero_description);
    formData.append("testimonial_main_title", data.testimonial_main_title);
    formData.append("hero_button_title", data.hero_button_title);
    formData.append("facebook", data.facebook);
    formData.append("twitter", data.twitter);
    formData.append("linkedin", data.linkedin);
    formData.append("contact_us_main_title", data.contact_us_main_title);
    formData.append("contact_us_description", data.contact_us_description);
    formData.append("partner_main_title", data.partner_main_title);
    formData.append("partner_description", data.partner_description);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    return formData;
  };

  const onEdit = (event) => {
    event.preventDefault();
    const valid = handleValidation();
    if (valid) {
      dispatch(updateFrontCMS(prepareFormData(heroSectionValue), adminApiBaseURL.FRONT_CMS_HERO_SECTION, adminActionType.FETCH_HERO_SECTION));
    }
  };

  return (
    <MasterLayout>
      <TopProgressBar />
      <TabTitle title={placeholderText("front-cms.hero-section.title")} />
      <form onSubmit={onEdit}>
        <div className="card">
          <div className="card-body">

            <div className="row">
              <div className='col-lg-6 mb-3'>

                <div className=" col-lg-4 mb-3">
                  <ImagePicker
                    imageTitle={placeholderText("front-cms.hero.image.title")}
                    imagePreviewUrl={logoPreview}
                    handleImageChange={(e) => handleImageChange(e, "hero_image")}
                  />
                  {errors.hero_image && (
                    <span className="text-danger d-block fw-400 fs-small mt-2">
                      {errors.hero_image}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  {getFormattedMessage("front-cms.hero.title.title")}:<span className="required" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("front-cms.hero.title.placeholder.label")}
                  name="hero_title"
                  value={heroSectionValue.hero_title || ''}
                  onChange={handleInputChange}
                />
                {errors.hero_title && (
                  <span className="text-danger d-block fw-400 fs-small mt-2">
                    {errors.hero_title}
                  </span>
                )}
              </div>

              <div className="col-lg-6 mb-3">
                <label
                  className='form-label'>{getFormattedMessage('front-cms.description.title')}:<span className="required" />
                </label>
                <textarea
                  name='hero_description'
                  className='form-control'
                  rows='3'
                  placeholder={placeholderText('front-cms.description.placeholder.label')}
                  onChange={handleInputChange}
                  value={heroSectionValue.hero_description || ''} />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['hero_description'] ? errors['hero_description'] : null}</span>
              </div>

              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  {getFormattedMessage("front-cms.button.title")}:<span className="required" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("front-cms.button.input.label")}
                  name="hero_button_title"
                  value={heroSectionValue.hero_button_title || ''}
                  onChange={handleInputChange}
                />
                {errors.hero_button_title && (
                  <span className="text-danger d-block fw-400 fs-small mt-2">
                    {errors.hero_button_title}
                  </span>
                )}
              </div>

              <div className="col-lg-6 mb-3">
                <label
                  className='form-label'>{getFormattedMessage("testimonial-main.title")}:<span className="required" />
                </label>
                <input
                  type='text'
                  name='testimonial_main_title'
                  value={heroSectionValue.testimonial_main_title}
                  placeholder={placeholderText("testimonial.title.input.label")}
                  className='form-control'
                  autoComplete='off'
                  onChange={handleInputChange}
                />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['testimonial_main_title'] ? errors['testimonial_main_title'] : null}</span>
              </div>
            </div>

            <div className='row'>
              <div className='col-md-6 mb-3'>
                <label
                  className='form-label'>{getFormattedMessage("partner.main.title")}: </label>
                <span className='required' />
                <input
                  type='text'
                  name='partner_main_title'
                  value={heroSectionValue.partner_main_title}
                  placeholder={placeholderText("front-cms.title.placeholder.label")}
                  className='form-control'
                  autoComplete='off'
                  onChange={handleInputChange}
                />
                <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['partner_main_title'] ? errors['partner_main_title'] : null}</span>
              </div>
              <div className="col-lg-6 mb-3">
                <label
                  className='form-label'>{getFormattedMessage("partner.main-description.title")}:<span className="required" />
                </label>
                <textarea
                  name='partner_description'
                  className='form-control'
                  rows='3'
                  placeholder={placeholderText('front-cms.description.placeholder.label')}
                  onChange={handleInputChange}
                  value={heroSectionValue.partner_description || ''} />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['partner_description'] ? errors['partner_description'] : null}</span>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  {getFormattedMessage("contect.us.title")}:
                </label>
              </div>
            </div>

            <div className='row'>
              <div className='col-md-6 mb-3'>
                <label
                  className='form-label'>{getFormattedMessage("contact.main.title")}: </label>
                <span className='required' />
                <input
                  type='text'
                  name='contact_us_main_title'
                  value={heroSectionValue.contact_us_main_title}
                  placeholder={placeholderText("front-cms.title.placeholder.label")}
                  className='form-control'
                  autoComplete='off'
                  onChange={handleInputChange}
                />
                <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['contact_us_main_title'] ? errors['contact_us_main_title'] : null}</span>
              </div>
              <div className="col-lg-6 mb-3">
                <label
                  className='form-label'>{getFormattedMessage("contact.description.title")}:<span className="required" />
                </label>
                <textarea
                  name='contact_us_description'
                  className='form-control'
                  rows='2'
                  placeholder={placeholderText('front-cms.description.placeholder.label')}
                  onChange={handleInputChange}
                  value={heroSectionValue.contact_us_description || ''} />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['contact_us_description'] ? errors['contact_us_description'] : null}</span>
              </div>

              <div className='col-lg-6 mb-3'>
                <label
                  className='form-label'>{getFormattedMessage("globally.input.email.label")}: </label>
                <span className='required' />
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("globally.input.email.placeholder.label")}
                  name="email"
                  value={heroSectionValue.email || ''}
                  onChange={handleInputChange}
                />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['email'] ? errors['email'] : null}</span>
              </div>
              <div className='col-lg-6 mb-3'>
                <label
                  className='form-label'>{getFormattedMessage("globally.input.address.label")}: </label>
                <span className='required' />
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("globally.input.address.placeholder.label")}
                  name="address"
                  value={heroSectionValue.address || ''}
                  onChange={handleInputChange}
                />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['address'] ? errors['address'] : null}</span>
              </div>
              <div className='col-lg-6 mb-3'>
                <label
                  className='form-label'>{getFormattedMessage("pos-sale.detail.Phone.info")}: </label>
                <span className='required' />
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("globally.input.phone-number.placeholder.label")}
                  name="phone"
                  onKeyPress={(event) => phoneValidate(event)}
                  value={heroSectionValue.phone || ''}
                  onChange={handleInputChange}
                />
                <span
                  className='text-danger d-block fw-400 fs-small mt-2'>{errors['phone'] ? errors['phone'] : null}</span>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  {getFormattedMessage("front-cms.hero.social.link.title")}:
                </label>
              </div>
            </div>

            <div className="row">
              <div className='col-lg-6 mb-3 d-flex justify-content-between'>
                <span className='p-3 fs-1 text-primary'><FontAwesomeIcon icon={faFacebook} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("front-cms.hero.facebook.placeholder.label")}
                  name="facebook"
                  value={heroSectionValue.facebook || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className='col-lg-6 mb-3 d-flex justify-content-between'>
                <span className='p-3 fs-1 '><FontAwesomeIcon icon={faXTwitter} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("front-cms.hero.twitter.placeholder.label")}
                  name="twitter"
                  value={heroSectionValue.twitter || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className='col-lg-6 mb-3 d-flex justify-content-between'>
                <span className='p-3 fs-1 text-primary'><FontAwesomeIcon icon={faLinkedin} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={placeholderText("front-cms.hero.linkedin.placeholder.label")}
                  name="linkedin"
                  value={heroSectionValue.linkedin || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <button
                className="btn btn-primary mt-4"
                type="submit"
              >
                {getFormattedMessage("globally.save-btn")}
              </button>
              <button
                className='btn btn-secondary mt-4 mx-2'
                type='button'
              >
                {getFormattedMessage("globally.cancel-btn")}
              </button>
            </div>

          </div>
        </div>
      </form>
    </MasterLayout>
  )
}

export default HeroSection;