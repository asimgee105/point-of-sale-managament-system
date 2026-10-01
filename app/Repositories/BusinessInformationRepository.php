<?php

namespace App\Repositories;

use App\Models\BusinessInformation;

/**
 * Class BusinessInformationRepository
 */
class BusinessInformationRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'title',
        'description',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return BusinessInformation::class;
    }
}
