package app.services;

public class DistanceCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double kilometers(double latitude1, double longitude1, double latitude2, double longitude2) {
        double latitudeDifference = Math.toRadians(latitude2 - latitude1);
        double longitudeDifference = Math.toRadians(longitude2 - longitude1);

        double a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2)
                + Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2))
                * Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);

        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
