<?php

namespace App\Http\Controllers;
use App\Attachment;
use App\Events\GlobalNotifications;
use App\Object2Object;
use App\Product;
use App\Productschema;
use App\Services\ExplorerNodeElasticQueries;
use App\Services\SeedToElastic;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Accessright;
use App\Explorernode;
use App\ManageCustomer;
use App\Contentbox;
use App\Exceptions\APIException;
use App\Providers\RequestStorageProvider;
use App\Http\Helpers\PaginationHelper;
use App\User;
use App\Project;
use App\Asset;
use App\Assettype;
use App\Http\Helpers\FilterHelper;
use App\AppModel;
use App\Folder;
use App\Folderschema;
use App\Asset2Product;
use App\Http\Helpers\HashHelper;
use App\Asset2ProductsFolderId;
use Session;

class ExplorernodesController extends AppController
{

    /**
     * @api {get} /explorernodes Retrieve list of explorernodes
     * @apiVersion 0.1.0
     * @apiName GetExplorernodes
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Retrieve a List of explorernodes
     * @apiParam {String}   parent_id            Hashed ID or internal Name of Explorernode
     * @apiSuccess {Object[]}  explorernodes Explorernodes
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given parent ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    public function index(Request $request)
    {
        if(config('app.elastic_search') == false){
            $this->reconvertedRequestParams($request);
            return $this->search($request);
        }

        $reference = null;

        if(isset($request->parent_id)){
            $reference = $request->parent_id;
        } else {
            if(isset($_REQUEST['parent_id'])){
                $reference = $_REQUEST['parent_id'];
            }
        }

        $elasticExplorerNodes = new ExplorerNodeElasticQueries($this->currentUser->id, $request, $reference);
        return $elasticExplorerNodes->execute();
    }

    public function elasticIndex(Request $request)
    {
        $reference = null;

        if(isset($request->parent_id)){
            $reference = $request->parent_id;
        } else {
            if(isset($_REQUEST['parent_id'])){
                $reference = $_REQUEST['parent_id'];
            }
        }

        $elasticExplorerNodes = new ExplorerNodeElasticQueries($this->currentUser->id, $request, $reference);
        return $elasticExplorerNodes->execute();
    }

    protected function search($request)
    {
        // we switch here between 'parent_id' and default search
        if (isset($request->parent_id)) {

            if ($_REQUEST['parent_id'] == ':photos_assets_create_root') {
                $explorernodeObj = new Explorernode();
                $assets = Asset::where('bo_provider_category', 'Photo')
                    ->where('bo_provider_reference_id', '!=', '')
                    ->where('bo_price_category', '!=', 4)
                    ->where('public', 1)
                    ->get();
                $explorernodes = [];
                foreach ($assets as $asset) {
                    $explorernodes[] = $explorernodeObj->makeLeafAsset($asset);
                }

            } elseif ($_REQUEST['parent_id'] == ':vectors_assets_create_root') {
                $explorernodeObj = new Explorernode();
                $assets = Asset::where('bo_provider_category', 'Vector')
                    ->where('bo_provider_reference_id', '!=', '')
                    ->where('bo_price_category', '!=', 4)
                    ->where('public', 1)
                    ->get();
                $explorernodes = [];
                foreach ($assets as $asset) {
                    $explorernodes[] = $explorernodeObj->makeLeafAsset($asset);
                }
            } else {
                if ($_REQUEST['parent_id'] == ':manage_root') {
                    parent::checkPermissions($request, "manage.manage.canDisplayManage");
                } else if ($_REQUEST['parent_id'] === ':create_root') {

                    parent::checkPermissions($request, "create.create.canDisplayCreate");
                } else if ($_REQUEST['parent_id'] == ':marketing_manage_root') {
                    parent::checkPermissions($request, "manage.marketing.canDisplayMarketing");
                } else if ($_REQUEST['parent_id'] == ':other_data_manage_root') {
                    parent::checkPermissions($request, "manage.otherdata.canDisplayOtherData");
                } else if ($_REQUEST['parent_id'] == ':advertising_projects_marketing_manage_root') {
                    parent::checkPermissions($request, "manage.marketingadvertisingprojects.canDisplayAdvertisingProjects");
                } else if ($_REQUEST['parent_id'] == ':design_elements_marketing_manage_root') {
                    parent::checkPermissions($request, "manage.marketingdesignelements.canDisplayDesignElements");
                }

                $explorernodeObject = Explorernode::findById($request->parent_id);
                if (!$explorernodeObject) {
                    throw new APIException('OBJECT_NOT_FOUND', 404);
                }

                $explorernodes = $explorernodeObject->children($this->currentUser, $ignorePermissions = false);
            }
        } else {
            $explorernodes = Explorernode::findAllById();
        }

        return PaginationHelper::execPagination(
            'explorernodes',
            $explorernodes,
            $request
        );
    }


    /**
     * @api {get} /explorernodes/:id Get an explorernode
     * @apiVersion 0.1.0
     * @apiName GetExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Get an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    public function show(Request $request)
    {

        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);

        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }

    /**
     * @api {put} /explorernodes/rename/:id Get an explorernode
     * @apiVersion 0.1.0
     * @apiName RenameExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Rename an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     * @apiError (Exceptions) {Exception} ExplorernodeUpdateError Unable to update the explorernode - see validation errors
     */
    public function rename(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        if ($explorernodeObject->rename($request->name)) {
            return ['explorernode' => $explorernodeObject];
        } else {
            throw new APIException('OBJECT_UPDATE_ERROR', 500, $explorernodeObject->getValidationErrorMessages());
        }
    }

    /**
     * @api {post} /explorernodes/dublicate/:id Dublicate an explorernode
     * @apiVersion 0.1.0
     * @apiName DublicateExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Dublicate an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    //NOT READY YET - TASK TODO
    public function dublicate(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }

    /**
     * @api {put} /explorernodes/move/:id Move an explorernode
     * @apiVersion 0.1.0
     * @apiName MoveExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Move an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    //NOT READY YET - TASK TODO
    public function move(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }

    /**
     * @api {get} /explorernodes/history/:id Show history of an explorernode
     * @apiVersion 0.1.0
     * @apiName HistoryExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Show history of an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    //NOT READY YET - TASK TODO
    public function history(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }

    /**
     * @api {get} /explorernodes/download/:id Download an explorernode
     * @apiVersion 0.1.0
     * @apiName DownloadExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Download an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    //NOT READY YET - TASK TODO
    public function download(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }


    /**
     * @api {put} /explorernodes/delete/:id Delete an explorernode
     * @apiVersion 0.1.0
     * @apiName DeleteExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Delete an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     * @apiError (Exceptions) {Exception} ExplorernodeDeleteError Unable to delete the explorernode
     */
    //NOT READY YET - TASK TODO
    public function delete(Request $request)
    {
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        if ($explorernodeObject->leaf->delete()) {
            return ['deleted' => true];
        } else {
            throw new APIException('OBJECT_DELETE_ERROR', 500);
        }
    }

    /**
     * @api {put} /explorernodes/rights/:id Set rights for an explorernode
     * @apiVersion 0.1.0
     * @apiName RightsExplorernode
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Set rights for an explorernode
     *
     * @apiSuccess {Object[]}  explorernode Explorernode
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    //NOT READY YET - TASK TODO
    public function rights(Request $request)
    {
        parent::checkPermissions($request, "myprofile.permissions.canEditObjectPermissions");
        $this->reconvertedRequestParams($request);

        $explorernodeObject = Explorernode::findById($request->id);
        if (!$explorernodeObject) {
            throw new APIException('OBJECT_NOT_FOUND', 404);
        }

        return ['explorernode' => $explorernodeObject];
    }

    /**
     * @api {get} /explorernodes/breadcrumb Get breadcrumb of explorernode
     * @apiVersion 0.1.0
     * @apiName GetBreadcrumb
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Get a breadcrumb
     *
     * @apiParam {String}    id                Hashed ID of explorernode
     *
     * @apiSuccess {Object[]}  breadcrumb Breadcrumb
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     * @apiError (Exceptions) {Exception} ExplorernodeNotFound Explorernode with given ID not found
     * @apiError (Exceptions) {Exception} UserHasNoRights User has no Right for this action
     */
    public function getBreadcrumb(Request $request)
    {
        $this->reconvertedRequestParams($request);

        if(config('app.elastic_search') == false){

            $explorernodeObject = Explorernode::findById($request->id);

            if (!$explorernodeObject) {
                throw new APIException('OBJECT_NOT_FOUND', 404);
            }

            return ['breadcrumb' => $explorernodeObject->breadcrumb];
        }

        $elasticObj = new ExplorerNodeElasticQueries($this->currentUser->id,$request, $request->id);

        return $elasticObj->fetchBreadcrumb();
    }

    /**
     * @api {get} /explorernodes/capabilities/:id Get capabilities of explorernode
     * @apiVersion 0.1.0
     * @apiName GetCapabilities
     * @apiGroup Explorernodes
     * @apiPermission user
     *
     * @apiDescription Get capabilities of explorernode
     *
     * @apiSuccess {Object[]}  breadcrumb Breadcrumb
     * @apiUse ExplorernodeReturnSuccess
     * @apiUse TimestampsBlock
     *
     */
    public function getCapabilities(Request $request)
    {
        # toDO
        #$converted = $this->convertRequest($request);
        #$explorernode = new Explorernode;
        #$explorernode = $explorernode->getCapabilities($converted, $this->currentUser);
        return ['permissions' => "FAIL"];
    }

    ################
    # PRIVATE AREA #
    ################

    private function reconvertedRequestParams(Request &$request)
    {
        $requestParams = RequestStorageProvider::get('request.sourceParams');

        // get original ID 
        if (!isset($request->id) && isset($requestParams['id']) != null) {
            $request->id = $requestParams['id'];
        }

        // get original ID 
        if (!isset($request->parent_id) && isset($requestParams['parent_id']) != null) {
            $request->parent_id = $requestParams['parent_id'];
        }
    }


    public function getNodeInfo(Request $request) {
        $explorernodeObject = Explorernode::findById($request->id);
        if ($explorernodeObject->leaf_type == 'asset') {
            $asset = Asset::where('id', $explorernodeObject->leaf_id)->first();
            $folder = Folder::where('id', $asset->parent_id)->first();
            if (isset($folder['capabilities']['folder_type']['data'])) {
                if ($folder['capabilities']['folder_type']['data'] == 20)  {
                    $objectRelation = Object2Object::where("receiver_object_id", $folder->id)->where("receiver_object_type", 'Folder')->where("sender_object_type", 'Product')->first();
                    if ($objectRelation) {
                        $product = Product::where('id', $objectRelation->sender_object_id)->first();
                        $productschema = Productschema::where('id', $product->productschema_id)->first();
                        $productSchemaData = $productschema->productschemaAttributecategoriesWithAttributesWithValue($objectRelation->sender_object_id);
                        if($productSchemaData){
                            $this->masterData = $productSchemaData;
                            return ['masterdata' => $productSchemaData];
                        }
                    }
                }
            }
        }
        return ['response' => "success"];
    }

    public function uploadFolderImage(Request $request)
    {
        $folder = Folder::where('user_id', $this->currentUser->id)->where("id", $request->id)->first();
        Attachment::where('object_type', 'folder')->where('object_id', $request->id)->delete();
        $folder->saveAttachment($request['folderImage']);
        if (config('app.elastic_search')) {
            (new SeedToElastic($this->currentUser->id))->seedExplorerNode($folder);
        }
        return ['folder' => $folder];
    }

}