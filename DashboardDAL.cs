using E2MAS.DAL.Interface;
using E2MAS.Model;
using E2MAS.Model.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace E2MAS.DAL.Implementation
{
    public class DashboardDAL : IDashboardDAL
    {
        private readonly E2MASEntities _dbContext;
        public DashboardDAL(E2MASEntities dbContext)
        {
            _dbContext = dbContext;
        }
        public async Task<E2MASSummary> getSummary()
        {
            E2MASSummary summary = null;
            try
            {
                E2MASSummaryStatus obj = null;
                obj = await _dbContext.Database.SqlQuery<E2MASSummaryStatus>("[E2MAS].[API_GetIntegratedScenarioSummary]").FirstOrDefaultAsync();
                summary = new E2MASSummary();
                summary.statusSummary = obj;
                List<E2MASModelSummary> objModelSummary = null;
                objModelSummary = await _dbContext.Database.SqlQuery<E2MASModelSummary>("[E2MAS].[API_GetScenarioModelStatus] @ScenarioID",
                     new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = 0 }).ToListAsync();
                summary.modelSummary = objModelSummary;             
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return summary;
        }
        public async Task<List<E2MASModelSummary>> getE2MASModelSummary(int scenarioId)
        {
            try
            {
                List<E2MASModelSummary> objModelSummary = null;
                objModelSummary = await _dbContext.Database.SqlQuery<E2MASModelSummary>("[E2MAS].[API_GetScenarioModelStatus] @ScenarioID",
                     new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId }).ToListAsync();
                return objModelSummary;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<List<E2MASModelSummary>> getScenarioStatus(int scenarioId)
        {
            try
            {
                List<E2MASModelSummary> objModelSummary = null;
                objModelSummary = await _dbContext.Database.SqlQuery<E2MASModelSummary>("[E2MAS].[API_GetScenarioModelStatus] @ScenarioID",
                     new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId }).ToListAsync();

                return objModelSummary;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<List<ScenarioLists>> getScenarioList()
        {
            try
            {
                List<ScenarioLists> scenarioList = null;
                scenarioList = _dbContext.ScenarioDetails.AsEnumerable().Where(x => x.IsActive == true && x.ScenarioMode == E2MASConstants.INTEGRATEDMODE && x.ScenarioStatus != E2MASConstants.SCENARIOIAPPROVED).Select((w, i) => new ScenarioLists
                {
                    ScenarioId = w.ScenarioId,
                    ScenarioName = w.ScenarioName
                }).OrderByDescending(x => x.ScenarioId).ToList();
                return scenarioList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public async Task<EnergyBalanceReports> getEnergyBalanceReport(int scenarioId, string countryName, int year, bool IsChanged)
        {
            EnergyBalanceReports objReports = null;
            List<EnergyBalanceReport> objreport = null;
            try
            {
                string lcountryName = "";
                int lyear = 0;
                objReports = new EnergyBalanceReports();
                if (!IsChanged)
                {
                    ScenarioInputDetail objInput = await _dbContext.ScenarioInputDetails.Where(x => x.ScenarioId == scenarioId).FirstOrDefaultAsync();
                    if (objInput != null)
                    {
                        objReports.startYear = objInput.StartYear;
                        objReports.endYear = objInput.EndYear;
                    }
                    List<EnergyBalanceCountry> country = null;
                    country = (from cm in _dbContext.ScenarioCountryMappings
                               join cd in _dbContext.CountryDetails on cm.CountryID equals cd.CountryId
                               where cm.ScenarioID == scenarioId
                               select new EnergyBalanceCountry
                               {
                                   countryId = cm.CountryID,
                                   countryName = cd.CountryName
                               }).ToList();
                    objReports.country = country;
                    lcountryName = country[0].countryName;
                    lyear = objInput.StartYear;
                }
                else
                {
                    lcountryName = countryName;
                    lyear = year;
                }
                objreport = await _dbContext.Database.SqlQuery<EnergyBalanceReport>("[E2MAS].[USP_PrepareIEAReport] @SCENARIOID,@COUNTRY,@YEAR",
                            new SqlParameter { ParameterName = "@SCENARIOID", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = scenarioId },
                            new SqlParameter { ParameterName = "@COUNTRY", SqlDbType = SqlDbType.VarChar, Direction = ParameterDirection.Input, Value = lcountryName },
                            new SqlParameter { ParameterName = "@YEAR", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Input, Value = lyear }).ToListAsync();
                objReports.report = objreport;
                return objReports;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
