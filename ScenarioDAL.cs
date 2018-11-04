using E2MAS.DAL.Interface;
using E2MAS.Model.Common;
using E2MAS.Model.E2MAS;
using E2MAS.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace E2MAS.DAL.Implementation.Scenario
{
    public class ScenarioDAL : IScenarioDAL
    {
        private readonly E2MASEntities _dbContext;
        public ScenarioDAL(E2MASEntities dbContext)
        {
            _dbContext = dbContext;
        }
        public List<ScenarioModels> getScenarioSequence()
        {
            try
            {
                List<ScenarioModels> scenarioModels = null;
                scenarioModels = _dbContext.ModelDetails.AsEnumerable().Select((w, i) => new ScenarioModels
                {
                    ModelId = w.ModelId,
                    ModelCode = w.ModelCode,
                    ModelName = w.ModelName
                }).ToList();
                return scenarioModels;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<ScenarioInputs> getScenarioInputs()
        {
            try
            {
                ScenarioInputs inputs = new ScenarioInputs();
                List<ScenarioBases> scenarioBase = _dbContext.ScenarioDetails.AsEnumerable().Where(x => x.IsActive == true && x.ScenarioMode == E2MASConstants.INTEGRATEDMODE).Select((w, i) => new ScenarioBases
                {
                    ScenarioId = w.ScenarioId,
                    ScenarioName = w.ScenarioName,
                    ScenarioMode = w.ScenarioMode
                }).OrderByDescending(x => x.ScenarioId).ToList();
                inputs.scenarioBases = scenarioBase;
                List<ScenarioModels> scenarioModels = _dbContext.ModelDetails.AsEnumerable().Where(x => x.IsActive == true).Select((w, i) => new ScenarioModels
                {
                    ModelId = w.ModelId,
                    ModelCode = w.ModelCode,
                    ModelName = w.ModelName
                }).ToList();
                inputs.scenarioModels = scenarioModels;
                List<ScenarioCountries> scenarioCountries = await _dbContext.Database.SqlQuery<ScenarioCountries>("[E2MAS].[API_GetCountryList]").ToListAsync();
                inputs.scenarioCountries = scenarioCountries;
                return inputs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<SaveScenarioReponse> saveScenario(SaveScenario scenarioInputs)
        {
            SaveScenarioReponse objResponse = new SaveScenarioReponse();
            int scenarioId = 0;
            objResponse.Status = false;
            objResponse.StatusMessage = "";
            var scenarioExist = await _dbContext.ScenarioDetails.Where(x => x.ScenarioName == scenarioInputs.scenarioDetails.ScenarioName && x.IsActive).FirstOrDefaultAsync();
            if (scenarioExist == null)
            {
                ScenarioDetail scenariodtls = new ScenarioDetail()
                {
                    ScenarioId = scenarioInputs.scenarioDetails.ScenarioId,
                    ScenarioName = scenarioInputs.scenarioDetails.ScenarioName,
                    ScenarioStatus = scenarioInputs.scenarioDetails.ScenarioStatus,
                    IsActive = scenarioInputs.scenarioDetails.IsActive,
                    CreatedBy = scenarioInputs.scenarioDetails.CreatedBy,
                    CreatedDate = DateTime.UtcNow,
                    ModifiedBy = scenarioInputs.scenarioDetails.ModifiedBy,
                    ModifiedDate = scenarioInputs.scenarioDetails.ModifiedDate,
                    // ApprovedBy = scenarioInputs.scenarioDetails.ApprovedBy,
                    ApprovedDate = scenarioInputs.scenarioDetails.ApprovedDate,
                    Comments = scenarioInputs.scenarioDetails.Remarks,
                    ScenarioMode = scenarioInputs.scenarioDetails.ScenarioMode,
                    BaseScenarioId = scenarioInputs.scenarioDetails.BaseScenarioId,
                    IterationID = 1,
                    IsEnergyBalanceIncluded = scenarioInputs.scenarioDetails.IsEnergyBalance
                };
                _dbContext.ScenarioDetails.Add(scenariodtls);
                _dbContext.SaveChanges();
                scenarioId = scenariodtls.ScenarioId;
                if (scenarioId > 0)
                {
                    List<string> countries = new List<string>();
                    countries = scenarioInputs.scenarioCountryMapping;
                    DataTable dtCountries = new DataTable();
                    dtCountries.Columns.Add("CountryName", typeof(string));
                    foreach (string str in countries)
                    {
                        DataRow row = dtCountries.NewRow();
                        row["CountryName"] = str;
                        dtCountries.Rows.Add(row);
                    }
                    var countryType = new SqlParameter("@CountryType", SqlDbType.Structured);
                    countryType.Value = dtCountries;
                    countryType.TypeName = "E2MAS.CountryType";
                    DataTable scenarioSequence = ToDataTable(scenarioInputs.scenarioSequence);
                    var ScenarioSequenceType = new SqlParameter("@ScenarioSequenceType", SqlDbType.Structured);
                    ScenarioSequenceType.Value = scenarioSequence;
                    ScenarioSequenceType.TypeName = "E2MAS.ScenarioSequenceType";
                    objResponse = await _dbContext.Database.SqlQuery<SaveScenarioReponse>("exec [E2MAS].[API_CreateScenario] @ScenarioID,@StartYear,@EndYear,@IsPricing,@Remarks,@ScenarioSequenceType,@CountryType",
                        new SqlParameter { ParameterName = "@ScenarioID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId },
                        new SqlParameter { ParameterName = "@StartYear", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioInputs.scenarioInputDetail.StartYear },
                        new SqlParameter { ParameterName = "@EndYear", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = scenarioInputs.scenarioInputDetail.EndYear },
                        new SqlParameter { ParameterName = "@IsPricing", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioInputs.scenarioInputDetail.IsPricing },
                        new SqlParameter { ParameterName = "@Remarks", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = scenarioInputs.scenarioInputDetail.Remarks },
                        countryType, ScenarioSequenceType).FirstOrDefaultAsync();
                    if (objResponse.Status)
                    {
                        objResponse.scenarioId = scenarioId;
                        string ModelCode = scenarioInputs.scenarioSequence[0].ModelName;
                        ScenarioSequenceDetail setInProgress = await _dbContext.ScenarioSequenceDetails.Where(x => x.ScenarioId == scenarioId && x.ModelName == ModelCode).FirstOrDefaultAsync();
                        if (setInProgress != null)
                        {
                            setInProgress.ModelStatus = E2MASConstants.SCENARIOINPROGRESS;
                            await _dbContext.SaveChangesAsync();
                        }
                    }
                }
                objResponse.dxiStatusMessage = initateFirstModelDXI(scenarioId, scenarioInputs.scenarioSequence[0].ModelName, 1);
            }
            else
            {
                objResponse.StatusMessage = scenarioInputs.scenarioDetails.ScenarioName + " already exist";
            }
            return objResponse;
        }
        public async Task<bool> checkScenarioName(string scenarioName)
        {
            try
            {
                bool isExist = false;
                isExist = _dbContext.ScenarioDetails.Where(x => x.IsActive == true).Any(x => x.ScenarioName == scenarioName.Trim());
                return isExist;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<ModelHeaderInputs> getScenarioDetails(int scenarioid, string currentModel)
        {
            ModelHeaderInputs inputs = null;
            try
            {
                ScenarioDetail scenario = new ScenarioDetail();
                scenario = await _dbContext.ScenarioDetails.Where(x => x.ScenarioId == scenarioid && x.IsActive == true).FirstOrDefaultAsync();
                if (scenario != null)
                {
                    inputs = new ModelHeaderInputs();
                    inputs.scenarioName = scenario.ScenarioName;
                    inputs.scenarioMode = scenario.ScenarioMode;
                    inputs.iterationID = scenario.IterationID;
                    inputs.commonHeader = await getScenarioSequence(scenarioid, currentModel);
                }
                return inputs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private async Task<List<CommonHeader>> getScenarioSequence(int scenarioid, string currentModel)
        {
            try
            {
                List<CommonHeader> scenarioModels = null;
                scenarioModels = await _dbContext.Database.SqlQuery<CommonHeader>("[E2MAS].[API_GetModelStatus] @SCENARIOID,@MODELCODE",
                     new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioid },
                     new SqlParameter { ParameterName = "@MODELCODE", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = currentModel }).ToListAsync();
                return scenarioModels;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<ScenarioViewInputs> getScenarioViewDetails(int scenarioid, string currentModel)
        {
            ScenarioViewInputs inputs = null;
            try
            {
                ScenarioDetail scenario = new ScenarioDetail();
                scenario = await _dbContext.ScenarioDetails.Where(x => x.ScenarioId == scenarioid && x.IsActive == true).FirstOrDefaultAsync();
                if (scenario != null)
                {
                    inputs = new ScenarioViewInputs();
                    inputs.ScenarioName = scenario.ScenarioName;
                    inputs.BaseScenarioId = (int)scenario.BaseScenarioId;
                    inputs.ScenarioRemarks = scenario.Comments;
                    inputs.IsEnergyBalance = scenario.IsEnergyBalanceIncluded;
                    inputs.scenarioMode = scenario.ScenarioMode;
                    string baseSecnarioName = "";
                    baseSecnarioName = _dbContext.ScenarioDetails.Where(x => x.ScenarioId == scenario.BaseScenarioId && x.IsActive == true).Select(x => x.ScenarioName).FirstOrDefault();
                    inputs.BaseScenarioName = baseSecnarioName;
                    List<ScenarioBases> scenarioBase = _dbContext.ScenarioDetails.Where(x => x.IsActive == true).AsEnumerable().Select((w, i) => new ScenarioBases
                    {
                        ScenarioId = w.ScenarioId,
                        ScenarioName = w.ScenarioName
                    }).ToList();
                    inputs.scenarioBase = scenarioBase;
                    List<ScenarioModels> scenarioModels = _dbContext.ModelDetails.AsEnumerable().Select((w, i) => new ScenarioModels
                    {
                        ModelId = w.ModelId,
                        ModelCode = w.ModelCode,
                        ModelName = w.ModelName
                    }).ToList();
                    inputs.scenarioModels = scenarioModels;
                    List<CommonHeader> scenarioSelectedModels = null;
                    scenarioSelectedModels = _dbContext.Database.SqlQuery<CommonHeader>("[E2MAS].[API_GetModelStatus] @SCENARIOID,@MODELCODE",
                         new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioid },
                         new SqlParameter { ParameterName = "@MODELCODE", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = currentModel }).ToList();
                    inputs.scenarioSelectedModels = scenarioSelectedModels;
                    List<ScenarioCountries> scenarioCountries = await _dbContext.Database.SqlQuery<ScenarioCountries>("[E2MAS].[API_GetCountryList]").ToListAsync();
                    inputs.scenarioCountries = scenarioCountries;
                    List<CommonInputCountries> scenarioSelectedcountries = _dbContext.Database.SqlQuery<CommonInputCountries>("[E2MAS].[API_GetScenarioCountries] @SCENARIOID",
                    new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioid }).ToList();
                    inputs.scenarioSelectedcountries = scenarioSelectedcountries;
                    CommonInputYears years = _dbContext.Database.SqlQuery<CommonInputYears>("[E2MAS].[API_GetScenarioInputDetails] @SCENARIOID",
                     new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioid }).FirstOrDefault();
                    inputs.InputYears = years;
                }
                return inputs;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<List<ScenarioBases>> getScenarioBasesByModelId(string modelCode)
        {
            try
            {
                List<ScenarioBases> scenarioBase = await (from secSeq in _dbContext.ScenarioSequenceDetails
                                                          join secdt in _dbContext.ScenarioDetails
                                                          on secSeq.ScenarioId equals secdt.ScenarioId
                                                          where secSeq.ModelName == modelCode && secdt.IsActive == true
                                                          select new ScenarioBases
                                                          {
                                                              ScenarioId = secdt.ScenarioId,
                                                              ScenarioName = secdt.ScenarioName,
                                                              ScenarioMode = secdt.ScenarioMode
                                                          }).Distinct().OrderByDescending(x => x.ScenarioId).ToListAsync();
                return scenarioBase;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<ScenarioBasesByScenarioId> getBaseScenarioValueById(int scenarioid)
        {
            ScenarioBasesByScenarioId scenarioData = null;
            try
            {
                scenarioData = new ScenarioBasesByScenarioId();
                ScenarioInputDetail detail = await _dbContext.ScenarioInputDetails.Where(x => x.ScenarioId == scenarioid).FirstOrDefaultAsync();
                if (detail != null)
                {
                    scenarioData.startYear = detail.StartYear;
                    scenarioData.endtYear = detail.EndYear;
                }
                List<VmScenarioCountryMapping> countries = (from cm in _dbContext.ScenarioCountryMappings
                                                            join cd in _dbContext.CountryDetails on cm.CountryID equals cd.CountryId
                                                            where cm.ScenarioID == scenarioid
                                                            select new VmScenarioCountryMapping
                                                            {
                                                                CountryName = cd.CountryName
                                                            }).ToList();
                scenarioData.countries = countries;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return scenarioData;
        }
        private string initateFirstModelDXI(int scenarioId, string modelcode, byte sequence)
        {
            string dxiStatus = string.Empty;
            var objStatus = new ObjectParameter("STATUS", typeof(string));
            _dbContext.USP_GetDXIModelInputs(scenarioId, modelcode, sequence, objStatus);
            dxiStatus = Convert.ToString(objStatus.Value);
            return dxiStatus;
        }
        private static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            return dataTable;
        }
        public async Task<List<ScenarioList>> getScenarioList()
        {
            List<ScenarioList> objlist = null;
            try
            {
                objlist = await _dbContext.Database.SqlQuery<ScenarioList>("[E2MAS].[API_GetScenarioList]").ToListAsync();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return objlist;
        }
        public async Task<GetScenarioStatus> getScenarioModelStatus(int scenarioId)
        {
            GetScenarioStatus status = null;
            try
            {
                List<ScenarioSequenceDetails> models = null;
                models = await (from ss in _dbContext.ScenarioSequenceDetails
                                join md in _dbContext.ModelDetails
                                on ss.ModelName equals md.ModelCode
                                where ss.ScenarioId == scenarioId && ss.ModelName != E2MASConstants.ENERGYBALANCEMODEL
                                select new ScenarioSequenceDetails
                                {
                                    ModelCode = ss.ModelName,
                                    ModelName = md.ModelName,
                                    ModelSequenceNumber = ss.ModelSequenceNumber,
                                    ModelStatus = ss.ModelStatus
                                }).ToListAsync();
                status = new GetScenarioStatus();
                status.Models = models;
                List<GetScenarioStatusComments> comments = (from ss in _dbContext.ScenarioActions.ToList().Where(x => x.ScenarioID == scenarioId)
                                                            select new GetScenarioStatusComments
                                                            {
                                                                ActionName = ss.ActionName,
                                                                Comments = ss.Comments,
                                                                CreatedDate = Convert.ToString(ss.CreatedDate)
                                                            }).OrderByDescending(x => x.CreatedDate).ToList();
                status.Comments = comments;
                return status;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<SaveScenarioFlowResponse> scenarioStatusChange(SaveScenarioFlow flow)
        {
            SaveScenarioFlowResponse response = null;
            try
            {
                response = await _dbContext.Database.SqlQuery<SaveScenarioFlowResponse>("[E2MAS].[SCENARIOREVERTAPPROVEITERATE] @SCENARIOID,@MODELSEQNO,@ISREVERT,@ISAPPROVED,@ISREJECTNOTSATISFIED,@COMMENTS",
                                 new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = flow.ScenarioId },
                                 new SqlParameter { ParameterName = "@MODELSEQNO", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = flow.ModelSeqNumber },
                                 new SqlParameter { ParameterName = "@ISREVERT", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = flow.IsRevert },
                                 new SqlParameter { ParameterName = "@ISAPPROVED", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = flow.IsApproved },
                                 new SqlParameter { ParameterName = "@ISREJECTNOTSATISFIED", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = flow.ReIterateIsNotSatisfied },
                                 new SqlParameter { ParameterName = "@COMMENTS", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = flow.Comments }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.StatusMessage = ex.Message;
            }
            return response;
        }
        public async Task<DeleteScenarioResponse> deleteScenario(List<int> inputs)
        {
            DeleteScenarioResponse response = null;
            try
            {
                using (var dbContextTransaction = _dbContext.Database.BeginTransaction())
                {
                    try
                    {
                        var result = from Q in _dbContext.ScenarioDetails
                                     where inputs.Contains(Q.ScenarioId)
                                     select Q;
                        result.ToList().ForEach(x => x.IsActive = false);
                        response = new DeleteScenarioResponse();
                        await _dbContext.SaveChangesAsync();
                        dbContextTransaction.Commit();
                        response.Status = true;
                    }
                    catch (Exception ex)
                    {
                        response.Status = false;
                        response.StatusMessage = ex.Message;
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return response;
        }
        public async Task<ScenarioTrackingResponse> getScenarioTrackingResponse(int scenarioId)
        {
            ScenarioTrackingResponse response = null;
            try
            {
                List<ScenarioTracking> objlist = await _dbContext.Database.SqlQuery<ScenarioTracking>("[E2MAS].[USP_GetVariableDataConversionDetails] @SCENARIOID",
                    new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId }).ToListAsync();
                response = new ScenarioTrackingResponse();
                response.trackingResponse = objlist;
                response.Status = true;
                response.StatusMessage = "";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.StatusMessage = ex.Message;
                throw ex;
            }
            return response;
        }
        public ScenarioLite GetScenarioLite(int scenarioId)
        {
            using (var context = new E2MASEntities())
            {
                return (from sc in context.ScenarioDetails
                        join input in context.ScenarioInputDetails on sc.ScenarioId equals input.ScenarioId

                        where sc.ScenarioId == scenarioId
                        select new ScenarioLite()
                        {
                            ScenarioId = sc.ScenarioId,
                            ScenarioName = sc.ScenarioName,
                            Description = input.Remarks,
                            StartYear = input.StartYear,
                            EndYear = input.EndYear,
                            Mode = sc.ScenarioMode
                        }).FirstOrDefault();
            }
        }
        public async Task<UpdateScenarioReponse> updateScenario(int ScenarioId, UpdateScenario sInputs)
        {
            UpdateScenarioReponse objResponse = new UpdateScenarioReponse();
            using (var dbContextTransaction = _dbContext.Database.BeginTransaction())
            {
                try
                {
                    objResponse.Status = false;
                    objResponse.StatusMessage = "";
                    int scenarioId = 0;
                    ScenarioDetail scenariodtls = await _dbContext.ScenarioDetails.Where(x => x.ScenarioId == ScenarioId && x.IsActive).FirstOrDefaultAsync();
                    if (scenariodtls != null)
                    {
                        scenariodtls.ScenarioName = sInputs.scenarioDetails.ScenarioName;
                        scenariodtls.ModifiedBy = sInputs.scenarioDetails.ModifiedBy;
                        scenariodtls.ModifiedDate = DateTime.UtcNow;
                        scenariodtls.Comments = sInputs.scenarioDetails.Remarks;
                        scenariodtls.ScenarioMode = sInputs.scenarioDetails.ScenarioMode;
                        scenariodtls.BaseScenarioId = sInputs.scenarioDetails.BaseScenarioId;
                        scenariodtls.IsEnergyBalanceIncluded = sInputs.scenarioDetails.IsEnergyBalance;
                        _dbContext.ScenarioDetails.Attach(scenariodtls);
                        _dbContext.Entry(scenariodtls).State = EntityState.Modified;
                        await _dbContext.SaveChangesAsync();
                        scenarioId = sInputs.scenarioDetails.ScenarioId;
                    }
                    if (scenarioId > 0)
                    {
                        List<string> countries = new List<string>();
                        countries = sInputs.scenarioCountryMapping;
                        DataTable dtCountries = new DataTable();
                        dtCountries.Columns.Add("CountryName", typeof(string));
                        foreach (string str in countries)
                        {
                            DataRow row = dtCountries.NewRow();
                            row["CountryName"] = str;
                            dtCountries.Rows.Add(row);
                        }
                        var countryType = new SqlParameter("@CountryType", SqlDbType.Structured);
                        countryType.Value = dtCountries;
                        countryType.TypeName = "E2MAS.CountryType";

                        DataTable scenarioSequence = ToDataTable(sInputs.scenarioSequence);
                        var ScenarioSequenceType = new SqlParameter("@ScenarioSequenceType", SqlDbType.Structured);
                        ScenarioSequenceType.Value = scenarioSequence;
                        ScenarioSequenceType.TypeName = "E2MAS.ScenarioSequenceType";
                        objResponse = await _dbContext.Database.SqlQuery<UpdateScenarioReponse>("exec [E2MAS].[API_UpdateScenario] @ScenarioID,@StartYear,@EndYear,@IsPricing,@Remarks,@ScenarioSequenceType,@CountryType",
                            new SqlParameter { ParameterName = "@ScenarioID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId },
                            new SqlParameter { ParameterName = "@StartYear", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = sInputs.scenarioInputDetail.StartYear },
                            new SqlParameter { ParameterName = "@EndYear", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = sInputs.scenarioInputDetail.EndYear },
                            new SqlParameter { ParameterName = "@IsPricing", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = sInputs.scenarioInputDetail.IsPricing },
                            new SqlParameter { ParameterName = "@Remarks", SqlDbType = SqlDbType.Char, Direction = ParameterDirection.Input, Value = sInputs.scenarioInputDetail.Remarks },
                            countryType, ScenarioSequenceType).FirstOrDefaultAsync();
                        if (objResponse.Status)
                        {
                            dbContextTransaction.Commit();
                            objResponse.scenarioId = scenarioId;
                            string ModelCode = sInputs.scenarioSequence[0].ModelName;
                            ScenarioSequenceDetail setInProgress = await _dbContext.ScenarioSequenceDetails.Where(x => x.ScenarioId == scenarioId && x.ModelName == ModelCode).FirstOrDefaultAsync();
                            if (setInProgress != null)
                            {
                                setInProgress.ModelStatus = E2MASConstants.SCENARIOINPROGRESS;
                                await _dbContext.SaveChangesAsync();
                            }
                            objResponse.dxiStatusMessage = initateFirstModelDXI(scenarioId, sInputs.scenarioSequence[0].ModelName, 1);
                        }
                    }
                }
                catch (Exception ex)
                {
                    objResponse.Status = false;
                    objResponse.StatusMessage = ex.Message;
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return objResponse;
        }
    }
}
