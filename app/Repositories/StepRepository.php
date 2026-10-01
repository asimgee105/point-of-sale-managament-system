<?php

namespace App\Repositories;

use App\Models\Step;

/**
 * Class StepRepository
 */
class StepRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'sub_title',
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
        return Step::class;
    }
}
