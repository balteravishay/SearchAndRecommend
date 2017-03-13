using Microsoft.ApplicationInsights;
using System;

namespace SearchRecommendSite.Managers
{
    public static class Extensions
    {
        public static void PerformActionAndTelemerty(this TelemetryClient @this, 
            Action action, string resourceId, string resourceName, string resourceTarget, 
            string resourceType, string actionName)
        {
            try
            {
                var time = PerformAndCount(action);
                @this.TrackDependency(new Microsoft.ApplicationInsights.DataContracts.DependencyTelemetry()
                {
                    Target = resourceTarget,
                    Data = actionName,
                    Type = resourceType,
                    Duration = time,
                    ResultCode = "OK",
                    Success = true,
                    Id = resourceId,
                    Name = resourceName
                });
            }
            catch (Exception e)
            {
                @this.TrackDependency(new Microsoft.ApplicationInsights.DataContracts.DependencyTelemetry()
                {
                    Target = resourceTarget,
                    Data = actionName,
                    Type = resourceType,
                    Duration = TimeSpan.FromMilliseconds(0),
                    ResultCode = "FAIL",
                    Success = false,
                    Id = resourceId,
                    Name = resourceName
                });
                throw;
            }
        }

        private static TimeSpan PerformAndCount(Action func)
        {
            var timer = DateTime.Now;
            func();
            return (DateTime.Now - timer);
        }
    }
}
